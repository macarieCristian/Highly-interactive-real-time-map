package ro.licence.cristian.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.repository.UserRepository;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<AppUser> getUsers() {
        return userRepository.findAll();
    }
}
