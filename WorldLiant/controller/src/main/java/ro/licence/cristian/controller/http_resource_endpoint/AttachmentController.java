package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.service.AttachmentService;
import ro.licence.cristian.persistence.model.Attachment;

@RestController
@AllArgsConstructor
@RequestMapping("/attachments")
public class AttachmentController {
    private AttachmentService attachmentService;

    // GET

    @GetMapping("/picture")
    public ResponseEntity<byte[]> getPicture(@RequestParam("idPicture") Long idPicture) throws BusinessException {
        Attachment attachment = attachmentService.getPictureWithId(idPicture);
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=" + attachment.getName())
                .contentType(MediaType.valueOf(attachment.getType()))
                .body(attachment.getContent());
    }
}
