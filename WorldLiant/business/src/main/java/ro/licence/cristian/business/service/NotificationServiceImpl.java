package ro.licence.cristian.business.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;

@Service
@PropertySource(value = "classpath:TemplateNotificationEventAdded.properties")
public class NotificationServiceImpl implements NotificationService {

    @Value("${text}")
    private String textNotificationEventAdded;

    @Override
    public String getTextNotificationEventAdded(String eventName, String scanAreas) {
        return MessageFormat.format(textNotificationEventAdded, eventName, scanAreas);
    }
}
