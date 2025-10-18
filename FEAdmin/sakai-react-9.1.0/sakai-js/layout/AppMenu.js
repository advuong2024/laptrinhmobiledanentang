import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem('token');
            localStorage.removeItem('quyen');
            alert("Bạn đã đăng xuất thành công!");
            router.push('/pages/login'); 
        }
    };

    const model = [
        {
            label: 'Trang chính',
            items: [{ label: 'Thống kê', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Quản lý',
            items: [
                { label: 'Khách hàng', icon: 'pi pi-fw pi-id-card', to: '/pages/User' },
                { label: 'Loại sản phẩm', icon: 'pi pi-fw pi-list', to: '/pages/ProductCategory' },
                { label: 'Sản phẩm', icon: 'pi pi-fw pi-inbox', to: '/pages/Product' },
                { label: 'Đánh giá sản phẩm', icon: 'pi pi-fw pi-comments', to: '/pages/Review' },
                { label: 'Đơn hàng', icon: 'pi pi-fw pi-shopping-cart', to: '/pages/Order' },
                { label: 'Đăng nhập', icon: 'pi pi-fw pi-id-card', to: '/pages/login' },
                { label: 'Đăng xuất', icon: 'pi pi-fw pi-sign-out', command: () => handleLogout() }
            ]
        },
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
