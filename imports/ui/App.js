import React, {Component} from 'react';
import {Router, Route, Switch, withRouter} from 'react-router-dom';
import {createBrowserHistory} from 'history';

import Header from './header/Header';
import AccountsUIWrapper from './AccountsUIWrapper.js';

import About from './about/About.js';
import Lorems from './lorems/Lorems.js';
import Lorem from './lorem/Lorem.js';

const browserHistory = createBrowserHistory();

export const renderApp = () => (
	<Router history={browserHistory}>
		<div id="header">
			<Header/>
		</div>
		<div id="content">
			<Switch>
				<Route exact path="/" component={Lorems}/>
				<Route exact path="/about" component={About}/>
				<Route exact path="/lorem/:id" component={Lorem}/>
				{/*<Route component={NotFoundPage}/>*/}
			</Switch>
		</div>
		<div id="user">
			<AccountsUIWrapper/>
		</div>
	</Router>
);