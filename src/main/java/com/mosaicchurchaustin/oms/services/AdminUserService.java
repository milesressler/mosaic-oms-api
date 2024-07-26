package com.mosaicchurchaustin.oms.services;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.PageFilter;
import com.auth0.client.mgmt.filter.RolesFilter;
import com.auth0.client.mgmt.filter.UserFilter;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.roles.Role;
import com.auth0.json.mgmt.roles.RolesPage;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;
import com.mosaicchurchaustin.oms.data.request.CreateUserRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateUserRequest;
import com.mosaicchurchaustin.oms.data.response.AdminUserDetailResponse;
import com.mosaicchurchaustin.oms.data.response.AdminUserResponse;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserService {

    @Autowired
    private ManagementAPI managementAPI;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    public AdminUserResponse addUser(final CreateUserRequest request) throws Auth0Exception {
        final User user = new User("Username-Password-Authentication");
        user.setEmail(request.email());
        user.setPassword(RandomStringUtils.randomAlphanumeric(32).toCharArray());
        return AdminUserResponse.from(managementAPI.users().create(user).execute().getBody());
    }

    public Page<AdminUserResponse> getUsers(final Pageable pageable) throws Auth0Exception {
        final UserFilter userFilter = new UserFilter().withPage(pageable.getPageNumber(), pageable.getPageSize());
        final UsersPage usersPage = managementAPI.users().list(userFilter)
                .execute().getBody();
        return new PageImpl<>(usersPage.getItems().stream()
                .map(AdminUserResponse::from).toList(), pageable, usersPage.getTotal()==null ? usersPage.getItems().toArray().length : usersPage.getTotal());
    }

    public AdminUserDetailResponse getUser(final String userId) throws Auth0Exception {
        final User user = managementAPI.users().get(userId, null).execute().getBody();
        final RolesPage rolesPage = managementAPI.users()
                .listRoles(userId, new PageFilter().withPage(0, 100)).execute().getBody();

        return AdminUserDetailResponse.from(user, rolesPage, orderHistoryRepository.findByUserEntityExternalIdOrderByTimestampDesc(userId).stream().limit(10).toList());
    }

    public AdminUserDetailResponse updateUser(final String userId, final UpdateUserRequest updateUserRequest) throws Auth0Exception {
        final User userToUpdate = managementAPI.users().get(userId, null).execute().getBody();
//        final RolesPage rolesOnUser = getUserRoles(userId);

//        final String authedUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        final RolesPage availableRoles = managementAPI.roles().list(new RolesFilter()).execute().getBody();


        if (!updateUserRequest.addRoles().isEmpty()) {
            final List<String> addRoleIds = updateUserRequest.addRoles().stream().map(requested -> roleIdFromName(availableRoles, requested)).toList();
                managementAPI.users().addRoles(userId, addRoleIds).execute().getBody();
        }

        if (!updateUserRequest.removeRoles().isEmpty()) {
            final List<String> removeRoleIds = updateUserRequest.removeRoles().stream().map(requested -> roleIdFromName(availableRoles, requested)).toList();
            managementAPI.users().removeRoles(userId, removeRoleIds).execute().getBody();
        }
        return AdminUserDetailResponse.from(userToUpdate, getUserRoles(userId), orderHistoryRepository.findByUserEntityExternalIdOrderByTimestampDesc(userId).stream().limit(10).toList());
    }

    private RolesPage getUserRoles(final String userId) throws Auth0Exception {
        return managementAPI.users()
                .listRoles(userId, new PageFilter().withPage(0, 100)).execute().getBody();
    }

    private String roleIdFromName(final RolesPage available, final String roleName) {
        return available.getItems().stream().filter(i -> i.getName().equalsIgnoreCase(roleName)).map(Role::getId).findAny().orElseThrow(() -> new RuntimeException("Role not valid."));
    }

}
