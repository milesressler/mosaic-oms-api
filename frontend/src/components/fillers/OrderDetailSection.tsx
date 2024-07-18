import {Order, OrderStatus} from "src/models/types.tsx";
import {useEffect} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Box, Button, Divider, Group, LoadingOverlay, Text, Title} from "@mantine/core";
import {useAuth0} from "@auth0/auth0-react";

interface OrderDetailSectionProps {
    order?: Order;
    onModified: () => void,
}

export function OrderDetailSection({order, onModified}: OrderDetailSectionProps) {

    const {user} = useAuth0();
    const orderDetailApi = useApi(ordersApi.getOrderById);
    const updateStateApi = useApi(ordersApi.updateOrderStatus);

    useEffect(() => {
        order && orderDetailApi.request(order.id);
    }, [order, updateStateApi.data]);


    const assignedToMe = orderDetailApi.data?.orderStatus === OrderStatus.ASSIGNED &&
        orderDetailApi.data?.lastStatusChange?.assigneeExt === user?.sub;

    const assignToMe: () => void = () => {
        if (assignedToMe) {
            unassign();
        } else {
            updateStateApi.request(order!.uuid, OrderStatus.ASSIGNED);
        }
    }
    const unassign: () => void = () => {
        updateStateApi.request(order!.uuid, OrderStatus.CREATED)
    }

    useEffect(() => {
        if (!updateStateApi.loading && !updateStateApi.error) {
            onModified();
            orderDetailApi.request(order!.id);
        }
    }, [updateStateApi.data]);

    return (<>
        <Box pos="relative">
        <LoadingOverlay visible={orderDetailApi.loading || updateStateApi.loading}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }} />
        <Group justify={'space-between'} pr={10}>
            <Title>Order: {order?.id}</Title>
            <Button onClick={assignToMe} disabled={
                orderDetailApi.loading ||
                orderDetailApi.data === null ||
                updateStateApi.loading ||
                ([OrderStatus.CREATED, OrderStatus.ASSIGNED].indexOf(orderDetailApi.data?.orderStatus) === -1 &&
                !assignedToMe)
            }
            >{assignedToMe ? "Unassign" : "Assign to Me"}</Button>
        </Group>
        <Divider></Divider>
        <Text>
            <Text span fw={500}>Customer:</Text> {orderDetailApi.data?.customer?.name}
        </Text>
        <Text><Text span fw={500}>Assigned:</Text>
            { orderDetailApi.data?.orderStatus === OrderStatus.ASSIGNED ?
                orderDetailApi.data?.lastStatusChange?.user ?? "[unassigned]" : "[unassigned]"}
        </Text>
        <Divider></Divider>
        <ul>
        {orderDetailApi.data?.items?.map((item) => {
            return <li key={item.id}>
                    <div key={item.id}>
                        <Text span fw={500}> {item.quantityRequested}</Text> {item.description}
                        <Text c={'dimmed'}>{item.notes}</Text>
                    </div>
                </li>
        })}
        </ul>
        </Box>
    </>);
}

export default OrderDetailSection;