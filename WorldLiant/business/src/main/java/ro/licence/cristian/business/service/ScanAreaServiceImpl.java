package ro.licence.cristian.business.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licence.cristian.business.dto.ScanAreaDto;
import ro.licence.cristian.business.mapper.ScanAreaMapper;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.ScanArea;
import ro.licence.cristian.persistence.repository.ScanAreaRepository;

@Log4j2
@Service
public class ScanAreaServiceImpl implements ScanAreaService {
    private ScanAreaRepository scanAreaRepository;
    private ScanAreaMapper scanAreaMapper;

    @Autowired
    public ScanAreaServiceImpl(ScanAreaRepository scanAreaRepository, ScanAreaMapper scanAreaMapper) {
        this.scanAreaRepository = scanAreaRepository;
        this.scanAreaMapper = scanAreaMapper;
    }

    @Override
    public Long saveScanArea(Long userId, ScanAreaDto scanAreaDto) {
        log.info("saveScanArea: userId={}, scanAreaDto={}", userId, scanAreaDto);
        ScanArea scanArea = scanAreaMapper.dtoToEntity(scanAreaDto);
        AppUser appUser = new AppUser();
        appUser.setId(userId);
        scanArea.setAppUser(appUser);
        ScanArea newScanArea = scanAreaRepository.save(scanArea);
        return newScanArea.getId();
    }

    @Override
    public Boolean deleteScanArea(Long scanAreaId) {
        log.info("deleteScanArea: scanAreaId={}", scanAreaId);
        scanAreaRepository.deleteById(scanAreaId);
        return true;
    }
}
