package ro.licence.cristian.business.service.websocket_service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.service.AttachmentService;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.repository.AttachmentRepository;

@Service
@AllArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {
    private AttachmentRepository attachmentRepository;

    @Override
    @Transactional
    public Attachment getPictureWithId(Long idPicture) throws BusinessException {
        return attachmentRepository.findById(idPicture)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.ATTACHMENT_DOES_NOT_EXIST));
    }
}
