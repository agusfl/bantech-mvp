import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import {FaBars, FaPowerOff} from 'react-icons/fa';
import {MdDashboard, MdAccountBalance, MdSettings} from 'react-icons/md';
import {GrTransaction} from 'react-icons/gr';
import {DiGoogleAnalytics} from 'react-icons/di';
import '../pages/styles/logo.css';
import logo from '../pages/styles/img/BanTech.png'

const Sidebar = ({children}) => {
    const [is_open, set_is_open] = useState(false);
    const toggle = () => set_is_open(!is_open);
    const menu_items = [
        {
            path:"/dashboard",
            name:"Dashboard",
            icon: <MdDashboard/>
        },
        {
            path:"/transactions",
            name:"Transactions",
            icon: <GrTransaction/>
        },
        {
            path:"/accounts",
            name:"Accounts",
            icon: <MdAccountBalance/>
        },
        {
            path:"/logout",
            name:"Log Out",
            icon: <FaPowerOff/>
        }
    ]
    return (
        <div className='container'>
            <div style={{width: is_open ? '250px' : '50px'}} className='sidebar'>
                <div className='top_section'>
                    <h1 style={{display: is_open ? 'block' : 'none'}} className='logo'><img className='logo-img' src={logo} alt="Logo" /></h1>
                    <div style={{marginLeft: is_open ? '50px' : '0px'}} className='bars'>
                        <FaBars onClick={toggle}/>
                    </div>
                </div>
                {
                    menu_items.map((item, index) => (
                        <NavLink to={item.path} key={index} className='link'>
                            <div className="icon">{item.icon}</div>
                            <div style={{display: is_open ? 'block' : 'none'}} className="link-text">{item.name}</div>
                        </NavLink>
                        
                    ))
                }
            </div>
            <main>{children}</main>
        </div>
    );
};

export default Sidebar;