package ro.licence.cristian.business.service;

import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.persistence.model.Attachment;

public interface AttachmentService {
    Attachment getPictureWithId(Long idPicture) throws BusinessException;
}
