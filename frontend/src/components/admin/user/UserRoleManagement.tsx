import {UserDetail} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import AdminUserApi from "src/services/adminUserApi.tsx";
import {Box, Checkbox, Divider, Title} from "@mantine/core";
import {ROLE_NAMES} from "src/models/constants.tsx";

interface UserRoleManagementProps {
    selectedUser: UserDetail|null;
    loading: boolean;
}

const UserRoleManagement = ({ selectedUser}: UserRoleManagementProps) => {
    const updateUserApi = useApi(AdminUserApi.updateUser);

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (selectedUser?.userId) {
            updateUserApi.request(selectedUser?.userId,
                checked ? [roleName] : [],
                !checked ? [roleName] : [],
            )
        }
    }

    const checkboxes = ROLE_NAMES.map((value) => (
        <Checkbox
            mt="xs"
            ml={33}
            label={value}
            key={value}
            checked={(updateUserApi?.data ?? selectedUser)?.roles?.map(i => i.toLowerCase()).indexOf(value.toLowerCase()) !== -1}
            onChange={(event) => handleRoleChange(value, event.currentTarget.checked)}
        />
    ));

    return (<Box>
        <Title>Roles</Title>
        <Divider/>
        {selectedUser && <>
            {checkboxes}
        </>}
    </Box>)
}

export default UserRoleManagement;
