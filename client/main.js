import React from 'react';
import {Meteor} from 'meteor/meteor';
import {render} from 'react-dom';
import {renderApp} from '../imports/ui/App.js';

import '../imports/startup/accounts-config.js';

Meteor.startup(() => render(
	renderApp(),
	document.getElementById('reactive-stack-app')
));
