import React from 'react';
import './Header.css';

import Title from './Title';
import Menu from './Menu';

export default function Header() {
	return (
		<div id="header-content">
			<div id="header-title">
				<Title/>
			</div>
			<div id="header-menu">
				<Menu/>
			</div>
		</div>
	);
}
