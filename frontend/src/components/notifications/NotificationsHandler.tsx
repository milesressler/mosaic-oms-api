import { notifications } from '@mantine/notifications';
import {useSubscription} from "react-stomp-hooks";
import {OrderNotification} from "src/models/types.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {usePreferences} from "src/contexts/PreferencesContext.tsx";
import routes from "src/routesConfig.tsx";
import {matchPath, useLocation} from "react-router-dom";
const USE_NOTIFICATIONS = import.meta.env.VITE_NOTIFICATIONS_ENABLED === 'true';
const SHOW_SELF_ACTIONS = import.meta.env.VITE_NOTIFICATIONS_SHOW_SELF === 'true';



export function NotificationsHandler({}) {

    const { user } = useAuth0();

    const { notificationsEnabled } = usePreferences();
    const location = useLocation();


    // Get active route
    const activeRoute = routes
        .flatMap((route: any) => route.children || [route])
        .find((route: any) => matchPath(route.path, location.pathname)) || {};

    function isSelfAction(notification: OrderNotification) {
        return (user && notification.userExtId === user.sub);
    }

    function shouldShow(notification: OrderNotification) {
        if (isSelfAction(notification) && !SHOW_SELF_ACTIONS) {
            return false;
        } else if (!notificationsEnabled) {
            return false;
        } else if (activeRoute.hideNotifications) {
            return false;
        } else {
            return true;
        }
    }

    if (!USE_NOTIFICATIONS) {
        return;
    }

    useSubscription("/topic/orders/created", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        if (!shouldShow(body)) {
            return;
        }
        notifications.show({
            // title: 'New Order Created',
            title: `${body.userName} created a new order`,
            message: null,
            autoClose: 3000,
        })
    });
    useSubscription("/topic/orders/status", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        if (!shouldShow(body)) {
            return;
        }
        const statusString = body.orderStatus;
        notifications.show({
            title: `${body.userName} updated order ${body.orderId} status to ${body.orderStatus}`,
            message: null,
            autoClose: 2000,
        })
    });
    useSubscription("/topic/orders/assignee", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        if (!shouldShow(body)) {
            return;
        }

        let messagecontent;

        if (!body.assigneeExtId) {
            messagecontent = `${body.userName} unassigned order ${body.orderId}`;
        } else if (body.assigneeExtId === body.userExtId) {
            messagecontent = `${body.userName} self-assigned order ${body.orderId}`;
        } else {
            messagecontent = `${body.userName} assigned order ${body.orderId} to ${body.assigneeName}`;
        }
        notifications.show({
            // title: !body.assigneeName ? 'Order Unassigned' : 'Order Assigned',
            title: messagecontent,
            message: null,
            autoClose: 2000,
            color: "cyan",
        })
    });

    return (<></>)
}

export default NotificationsHandler
