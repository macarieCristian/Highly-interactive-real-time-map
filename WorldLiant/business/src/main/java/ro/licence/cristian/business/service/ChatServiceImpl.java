package ro.licence.cristian.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licence.cristian.business.dto.websocket_dto.enums.EventType;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;
import ro.licence.cristian.business.mapper.SimpleMessageMapper;
import ro.licence.cristian.persistence.model.SimpleMessage;
import ro.licence.cristian.persistence.model.enums.MessageStatusType;
import ro.licence.cristian.persistence.repository.SimpleMessageRepository;
import ro.licence.cristian.persistence.repository.UserRepository;
import ro.licence.cristian.persistence.repository.websocket_repository.ActiveUsersInMemoryRepository;

import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    private SimpleMessageMapper simpleMessageMapper;
    private ActiveUsersInMemoryRepository activeUsersRepository;
    private SimpleMessageRepository simpleMessageRepository;
    private UserRepository userRepository;

    @Autowired
    public ChatServiceImpl(SimpleMessageMapper simpleMessageMapper, ActiveUsersInMemoryRepository activeUsersRepository, SimpleMessageRepository simpleMessageRepository, UserRepository userRepository) {
        this.simpleMessageMapper = simpleMessageMapper;
        this.activeUsersRepository = activeUsersRepository;
        this.simpleMessageRepository = simpleMessageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void persistMessage(SimpleMessageDto simpleMessageDto) {
        if (simpleMessageDto.getEventType().equals(EventType.CHAT_MESSAGE)) {
            SimpleMessage message = simpleMessageMapper.dtoToEntity(simpleMessageDto);
            message.getSource().setId(userRepository.findAppUserIdByUsername(message.getSource().getUsername()));
            message.getDestination().setId(userRepository.findAppUserIdByUsername(message.getDestination().getUsername()));

            if(activeUsersRepository.isUserConnected(message.getDestination().getUsername())) {
                message.setStatusType(MessageStatusType.SEEN);
            } else {
                message.setStatusType(MessageStatusType.UNSEEN);
            }
            simpleMessageRepository.save(message);
        }
    }

    @Override
    public List<SimpleMessageDto> getConversation(final String sourceUsername, final String destinationUsername) {
        return simpleMessageMapper.entitiesToDtos(simpleMessageRepository.getConversation(sourceUsername, destinationUsername));
    }
}
