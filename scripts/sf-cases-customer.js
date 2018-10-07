/* Copyright (c) 2017-present, salesforce.com, inc. All rights reserved */
/* Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */

'use strict';

var violet = require('violet').script();

var violetSFStore = require('violet/lib/violetStoreSF')(violet);
violetSFStore.store.propOfInterest = {
  'Case*': ['CaseNumber*', 'Contact*.Name*', /*'Contact*.Owner*.Name*',*/ 'Subject*', 'Status*', 'Priority*']
}

violet.addInputTypes({
  "name": "AMAZON.LITERAL",
  "company": "AMAZON.LITERAL",
  "opportunityName": "AMAZON.LITERAL",
});

// implement login - as a function of how we deploy
const userName = 'Stella Pavlova';


violet.respondTo({
  expecting: ['status of my cases'],
  resolve: function *(response) {
    var results = yield response.load('Case*', 'Contact*.Name*', userName);
    if (results.length == 0) {
      response.say('Sorry. You have no cases.');
      return;
    }

    // iterate through results and collect states in object 'status'
    var status = {};
    results.forEach((c)=>{
      if (!status[c.Status]) status[c.Status] = 0;
      status[c.Status]++;
    });

    var out = 'You have ' + results.length + ' cases. Of these'
    var states = Object.keys(status);
    states.forEach((s,ndx)=>{
      if (status[s]==1)
        out += status[s] + ' is ' + s;
      else
        out += status[s] + ' are ' + s;
      if (ndx == states.length-2) out += ' and ';
    });
    response.say(out);
}});


violet.respondTo({
  expecting: ['which case of mine changed states most recently'],
  resolve: function *(response) {
    var results = yield response.load('Case*', 'Contact*.Name*', 'Stella Pavlova', null, 'order by LastModifiedDate limit 1');
    if (results.length == 0) {
      response.say('Sorry. You have no cases.');
      return;
    }
    var caseObj = results[0];
    response.say('Your case ' + caseObj.Subject + ' has status ' + caseObj.Status + ' and priority ' + caseObj.Priority);
}});

violet.respondTo({
  expecting: ['tell me when one of my cases changes state'],
  resolve: function *(response) {
    response.say('Sure');
    // TODO: put a hook in sfdc, when we hear back, do the below (and test that it works)
    // TODO: test and implement below
    //violet.sendAlertMessage('One of your cases has changed state');
    //... in violet implennt as `_setAlert('message')` and have callback to clear
}});


module.exports = violet;
