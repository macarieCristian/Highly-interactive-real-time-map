package ro.licence.cristian.controller.http_resource_endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;
import ro.licence.cristian.business.service.ChatService;

import java.util.List;

@RequestMapping("/chat")
@RestController
public class ChatController {

    private ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // GET
    @GetMapping("/conversation")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccount(#source, authentication)")
    public ResponseEntity<List<SimpleMessageDto>> getConversation(@RequestParam("source") final String source,
                                                                  @RequestParam("destination") final String destination,
                                                                  Authentication authentication) {
        return ResponseEntity.ok(chatService.getConversation(source, destination));
    }
}
