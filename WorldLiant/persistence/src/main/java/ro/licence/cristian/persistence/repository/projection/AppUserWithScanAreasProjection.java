package ro.licence.cristian.persistence.repository.projection;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public interface AppUserWithScanAreasProjection {
    String getFirstName();
    String getLastName();
    String getUsername();
    String getEmail();
    String getPhone();
    String getScanAreas();
    default List<String> getScanAreaNames() {
        List<String> result = new ArrayList<>();
        if(getScanAreas() != null) {
            result = Stream.of(getScanAreas().split(","))
                    .collect(Collectors.toList());
        }
        return result;
    }
}
