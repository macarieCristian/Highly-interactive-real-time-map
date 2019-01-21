package ro.licence.cristian.controller.websocket_endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;

@Controller
public class WebSocketController {
    private SimpMessagingTemplate template;

    @Autowired
    public WebSocketController(SimpMessagingTemplate template) {
        this.template = template;
    }

    @MessageMapping("/broadcast/send")
    @SendTo("/topic/broadcast")
    public SimpleMessageDto greeting(SimpleMessageDto message) {
        message.setContent(message.getContent());
        return message;
    }

    @MessageMapping("/private/send")
    public void specific(SimpleMessageDto message) {
        template.convertAndSendToUser(message.getDestination(), "/queue/private/", message);
    }

}
