package ro.licence.cristian.business.service;

import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.Event;
import ro.licence.cristian.persistence.repository.projection.AppUserWithScanAreasProjection;

import java.util.List;

public interface EmailUtilService {

    void sendEmailEventAdded(List<AppUserWithScanAreasProjection> receivers, EventDto event);
}
