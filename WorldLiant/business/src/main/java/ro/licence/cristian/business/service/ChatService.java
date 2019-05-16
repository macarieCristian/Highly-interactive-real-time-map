package ro.licence.cristian.business.service;

import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;

import java.util.List;

public interface ChatService {

    void persistMessage(SimpleMessageDto simpleMessageDto);

    List<SimpleMessageDto> getConversation(final String sourceUsername, final String destinationUsername);

    void persistEventMessage(SimpleMessageDto simpleMessageDto);

    List<SimpleMessageDto> getConversation(final Long idEvent);
}
