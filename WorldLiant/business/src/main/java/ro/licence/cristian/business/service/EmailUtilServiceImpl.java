package ro.licence.cristian.business.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.persistence.repository.projection.AppUserWithScanAreasProjection;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.util.ByteArrayDataSource;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Log4j2
@PropertySource(value = "classpath:TemplateEventEmail.properties")
public class EmailUtilServiceImpl implements EmailUtilService {

    @Value("${newEvent.subject}")
    private String subjectNewEventEmail;

    @Value("${newEvent.text}")
    private String textNewEventEmail;

    private JavaMailSender emailSender;
    private static ExecutorService executor;
    private static final Integer THREAD_NUMBER = 1;

    static {
        executor = Executors.newFixedThreadPool(THREAD_NUMBER);
    }

    @Autowired
    public EmailUtilServiceImpl(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Override
    public void sendEmailEventAdded(List<AppUserWithScanAreasProjection> receivers, EventDto event) {
        executor.execute(new SendEmailEventAddedTask(receivers, event));
    }


    private class SendEmailEventAddedTask implements Runnable {
        private List<AppUserWithScanAreasProjection> receivers;
        private EventDto event;
        private List<MimeMessage> messages;

        SendEmailEventAddedTask(List<AppUserWithScanAreasProjection> receivers, EventDto event) {
            this.receivers = receivers;
            this.event = event;
            messages = new ArrayList<>();
        }

        @Override
        public void run() {
            try {
                for (AppUserWithScanAreasProjection receiver : receivers) {
                    messages.add(prepareMessage(receiver));
                }
                emailSender.send(messages.toArray(new MimeMessage[]{}));
            } catch (MessagingException e) {
                log.error("Error during sending event added email!");
            }
        }

        private MimeMessage prepareMessage(AppUserWithScanAreasProjection receiver) throws MessagingException {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            Integer scanAreasNum = receiver.getScanAreaNames().size();
            String scanAreas = receiver.getScanAreas();

            helper.setTo(receiver.getEmail());
            helper.setSubject(MessageFormat
                    .format(subjectNewEventEmail, event.getName(), scanAreasNum));

            helper.setText(MessageFormat
                    .format(textNewEventEmail, receiver.getLastName(), receiver.getFirstName(), scanAreas));

            helper.addAttachment("Main picture", new ByteArrayDataSource(
                    event.getProfilePicture().getContent(),
                    event.getProfilePicture().getType()));
            return message;
        }
    }
}
