package ro.licence.cristian.business.service;

import ro.licence.cristian.business.dto.ScanAreaDto;

public interface ScanAreaService {
    Long saveScanArea(Long userId, ScanAreaDto scanAreaDto);

    Boolean deleteScanArea(Long scanAreaId);
}
