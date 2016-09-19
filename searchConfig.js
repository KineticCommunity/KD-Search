//This is a sample configuration for a submission console
submissionSearch = {
    RequestsConfig:{
        // type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
        type: "BridgeDataTable",
        // responsive: OPTIONAL Default for "BridgeDataTable" is true but can be over written.
        // responsive: false,
        // processSingleResult does the same thing as the click callback would do if there is just one result
		// found, rather than displaying the one row for the user to click on. For console tables or tables you
		// want to always display, even if there is just one record, this should be set to false.
        processSingleResult: false,
		// clearOnClick: OPTIONAL Default is true but can be over written. This means that the table clears/is 
		// destroyed when the first row click occurs. This is often desirable for search tables, but undesirable 
		// for console tables.
        clearOnClick: false,
		// removeDups: OPTIONAL Default is FALSE. Will remove identical rows. This includes hidden columns and column order matters
		// the columns will only be removed if this is set to true and the rows are exactly identical.
		//removeDups: true,  
		// These are examples of datatable configuration that is simply passed through to datatables.
        "pageLength": 15,
        "order":[[1,"desc"]],   //order by KSR - note this is order of the data returned, not order of the data during the bridge search
        // Properties in the data must match the attributes of the Bridge Request or have a "notdynamic" option set to true. This would be on
		// the same level as title and className
        data: {
            "KSR Number":{
                //This will be the title of the column or the label of the element, depending on the search type
				title:"Request ID",
				//This will be the class given to the column/cell/div as appropriate for the search type
                className: "all"
            },
            "Submission Date":{
                title:"Submitted",
				//For responsive datatables, a class of all always displays, none is in the subrow data (responsive data), and never is always hidden
				//For non-responsive datatables, a class of hidden will hide the column. see https://datatables.net/extensions/responsive/classes
				//for more details and options
                className: "all",
                //This allows for dates to be formatted in whatever format desired, using moment.
				date:true,
                moment: "MM/DD/YYYY HH:mm:ss"
            },
            "Service Item Name":{
                title:"Service Item",
                className: "all"
            },
            "Validation Status":{
                title:"Status",
                className: "all"
            },
            "Requested For First Name":{
                title:"First Name",
                className: "all"
            },
            "Requested For Last Name":{
                title:"Last Name",
                className: "all"
            },
            "CustomerSurveyInstanceId":{
                title:"CustomerSurveyInstanceId",
                className: "never"
            }
                                               
        },
        //Where to append the table. This element should exist on the page
		//If a string is returned it will be processed as jQuery. Otherwise
		//return the element in a function.
        appendTo: function(){return $('#requestTableContainer');},
		//a string of the id to give the created table. This should not exist on the page.
        resultsContainerId: 'openReqTable',
        before: function(){ //before search         
        },
        success: function (){  //This occurs when results are found     
        },
        success_empty: function(){  //This occurs when the search is successful, but no results are found                                             
        },
        error: function(){  //This occurs if there is an error on the search      
        },
        complete: function(){   //This occurs when the build of the table is complete  
        },
        clickCallback: function(results){  //This occurs when a row is clicked
            //display submission details panel
            BUNDLE.ajax({
                url: BUNDLE.packagePath + 'interface/callbacks/submissionDetails.html.jsp?id=' + results['KSR Number'] + '&csrv=' + results['CustomerSurveyInstanceId'],
                type: "GET",
                success: function(data) {
                    var element = jQuery(data);
                    jQuery('#dialogContainer').append(element);
                                element.dialog({
                                closeText: 'close this window',
                                    width: 500
                                });
                    $(element).parent().append('<div class="kd-shadow"></div>');
                }
            });
        },
        createdRow: function ( row, data, index ) {  //This runs when the rows are being built. It is a passthrough to datatables.
		   //this is how you can add a class to the row being built.
           $('td',row).addClass("cursorPointer");
        },

        dom: 'Bfrtip',
    },
	//What follows are partial configs, meant to be used with/override the above. This would be done/executed like so:
	//KDSearch.executeSearch(submissionSearch.RequestsConfig, submissionSearch.myOpenRequestsConfig);
	//This allows for set up of the shared setup of the My Requests tables once, and then only the unique elements need
	//to be set up in the individual/override configurations.
	myOpenRequestsConfig:{
        //This is the bridge configuration
        bridgeConfig:{
		    //The name of the model used is specified here
            model: "CustomerSurveyBase",
			//The qualification mapping used is specified here. Note that this bridge and qualification mapping must be
			//exposed on the service item where this is being used.
            qualification_mapping: "Open By Requested For and Requested By",
            //Params to be created and passed to the Bridge.  VALUE MUST BE JQUERY SELECTOR if specified as a string.
			//This allows you to select values out of any element on the page, question or just dom element.
			//Otherwise, pass a function that returns the desired value. The function allows use of variables, etc.
            parameters: {'Login Id': function(){ return clientManager.userName;}},
        },
        
    },
    myClosedRequestsConfig:{
	    //Note that this qualification is different than in the override above. 
        bridgeConfig:{
            model: "CustomerSurveyBase",
            qualification_mapping: "Closed By Requested For and Requested By",
            parameters: {'Login Id': function(){ return clientManager.userName;}},
        },
        //Where to append the table. Note that this is different than the value in the original table
		//configuration. This will override that value when the two are used together. The same is true
		//with the next setting.
        appendTo: function(){return $('#requestTableContainer');},
        //ID to give the table when creating it. Note that this overrides the original.
        resultsContainerId: 'closedReqTable',

    },
    mySavedRequestsConfig:{
		//Note that this qualification is different than in the override above.
        bridgeConfig:{
            model: "CustomerSurveyBase",
            qualification_mapping: "Saved By Requested For and Requested By",
            parameters: {'Login Id': function(){ return clientManager.userName;}},
        },
        appendTo: function(){return $('#requestTableContainer');},
        resultsContainerId: 'savedReqTable',
		//What to do on row click. Note that this is different than the value in the original table
		//configuration. This will override that value when the two are used together. The same is true
		//with the next setting.
        clickCallback: function(results){
           //open the selected request in a window (default set by client as to whether it is in a new window, tab, etc)
           window.open('/kinetic/DisplayPage?csrv=' + results['CustomerSurveyInstanceId'] + '&return=yes');
        },
    },
}

//This is a requested for/manager example
SearchConfig ={
    requestedForConfig:{
        // type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
        type: "BridgeDataTable",
        // responsive: OPTIONAL Default for "BridgeDataTable" is true but can be over written.
        //responsive: false,
        bridgeConfig:{
		    //The name of the model used is specified here
            model: "People",
			//The qualification mapping used is specified here. Note that this bridge and qualification mapping must be
			//exposed on the service item where this is being used.
            qualification_mapping: "Enabled By Last Name",
            //Params to be created and passed to the Bridge.  VALUE MUST BE JQUERY SELECTOR if specified as a string.
			//This allows you to select values out of any element on the page, question or just dom element.
			//Otherwise, pass a function that returns the desired value. The function allows use of variables, etc.
			//Below is an example of getting the value out of a text question with jQuery (you could also use a function 
			//and KD.utils.Action.getQuestionValue) but getting a value out of a drop down list question is slightly 
			//different '[label="QuestionLabelHere"] select' 
            parameters: {'Last Name': '[label="Search By Last Name"] input'},
			//bridge metadata settings can be passed through
			metadata: {"order": [encodeURIComponent('<%=attribute["Last Name"]%>:ASC')] },
        },
		// processSingleResult does the same thing as the click callback would do if there is just one result
		// found, rather than displaying the one row for the user to click on. For console tables or tables you
		// want to always display, even if there is just one record, this should be set to false.
        processSingleResult: true,
        // Properties in the data must match the attributes of the Bridge Request or have a "notdynamic" option set to true. This would be on
		// the same level as title and className
        data: {
            "Last Name":{
			    //This will be the title of the column or the label of the element, depending on the search type
                title:"Last Name",
				//This will be the class given to the column/cell/div as appropriate for the search type
                className: "all",
				//This is the menu label of the question to be set with the value from this column and row when a row is clicked.
                setQstn:"ReqFor_Last Name",
            },
            "First Name":{
                title:"First Name",
				//For responsive datatables, a class of all always displays, none is in the subrow data (responsive data), and never is always hidden
				//For non-responsive datatables, a class of hidden will hide the column. see https://datatables.net/extensions/responsive/classes
				//for more details and options
                className: "all",
                setQstn:"ReqFor_First Name"
            },
            "Login ID":{
                title:"Login ID",
                className: "all",
                setQstn:"ReqFor_Login ID",
            },
            "Company":{
                title:"Company",
                className: "all",
                 setQstn:"ReqFor_Company",
            },
            "Organization":{
                title:"Organization",
                className: "all"
            },
            "Department":{
                title:"Department",
                className: "all",
                setQstn:"ReqFor_Department",
            },
            "Phone Number":{
                title:"Phone Number",
                className: "none",
                setQstn:"ReqFor_Phone",
            },
            "E-mail":{
                title:"Email",
                className: "none",
                setQstn:"ReqFor_Email",
            },
            "JobTitle":{
                title:"Job Title",
                className: "never",
                setQstn:"ReqFor_JobTitle",
            },
            "Site":{
                title:"Location",
                className: "never",
                setQstn:"ReqFor_Location",
            },
            "SupervisorID":{
                title:"Manager",
                className: "never",
                setQstn:"Mgr_Login ID",
            }
                                               
        },
        //Where to append the table. This element should exist on the page
		//If a string is returned it will be processed as jQuery. Otherwise
		//return the element in a function.
        appendTo: function(){return $('[label="Search Buttons"]');},
        //ID to give the table when creating it. This should not already exist
        resultsContainerId: 'reqForTable',
        before: function(){ //before search
		   //disable the search button so it can't be re-clicked and display a spinner/wait icon
           $('#searchReqFor').prop('disabled',true);
           $('#spinner_searchReqFor').show();
        },
        success: function (){ //this is done when results are returned successfully
		  //hide the spinner/wait icon
          $('#spinner_searchReqFor').hide();
        },
        success_empty: function(){  //this is done if a successful search returns no results
		  //hide the spinner/wait icon and display an alert
          $('#spinner_searchReqFor').hide();
          alert("Your search criteria did not return any results, please check your criteria and try again.");    
        },
        error: function(){  //this is done if the search errors
           
        },
        complete: function(){  //this is done when the build of the table completes
		   //format the resultant table to a particular width, for example.
           $('#reqForTable').width(936);
        },
        clickCallback: function(results){  //this is additional action (beyond set question) that happens on row click.
		    //the values of the row are available in results, indexed by the name of the attribute in the bridge
			//in this case, we are setting the returned supervisor ID into an additional question, firing change
			//of that question element, clearing the search field, and re-enabling the search button.
            KD.utils.Action.setQuestionValue('Mgr_Login ID', results['SupervisorID']);
            var MgmrElem = KD.utils.Util.getQuestionInput("Mgr_Login ID");
            KD.utils.Action._fireChange(MgmrElem);
            KD.utils.Action.setQuestionValue("Search By Last Name", "");
            $('#searchReqFor').prop('disabled',false);
        },
        createdRow: function ( row, data, index ) {  //this is done when the row is being built (a pass through to datatables)
		   //see https://datatables.net/reference/option/createdRow for details/options
        },
        dom: 'Bfrtip',
    },
    defaultRequestedForConfig:{
        // type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
        type: "BridgeGetSingle",
        bridgeConfig:{
            model: "People",
            qualification_mapping: "By Login ID",
            //Params to be created and passed to the Bridge.  VALUE MUST BE JQUERY SELECTOR if specified as a string.
			//This allows you to select values out of any element on the page, question or just dom element.
			//Otherwise, pass a function that returns the desired value. The function allows use of variables, etc.
            parameters: {'Login ID':  function(){return clientManager.userName;}},
        },
        processSingleResult: true,
        // Properties in the data must match the attributes of the Bridge Request
        data: {
		    //Note that title and class are not relevant options for BridgeGetSingle. The only relevant data options
			//are setQstn and Callback.
            "Last Name":{
			    //This is the menu label of the question to be set with the value from the record found
                setQstn:"ReqFor_Last Name",
            },
            "First Name":{
                setQstn:"ReqFor_First Name"
            },
            "Login ID":{
                setQstn:"ReqFor_Login ID",
            },
            "Company":{
                setQstn:"ReqFor_Company",
            },
            "Department":{
                setQstn:"ReqFor_Department",
            },
            "Phone Number":{
                setQstn:"ReqFor_Phone",
            },
            "E-mail":{
                setQstn:"ReqFor_Email",
            },
            "JobTitle":{
                setQstn:"ReqFor_JobTitle",
            },
            "Site":{
                setQstn:"ReqFor_Location",
            },
            "SupervisorID":{
				//since there is no row click (no table, no rows), if something should happen when the results are returned/set, a Callback
				//function should be set on one (or more) of the data values.
                callback:function(value){
				    //in this case we are setting the Mgr_Login ID and firing change, as we did on row click in the table above. For this 
					//default user config, using BridgeGetSingle we need to do it here in a Callback instead.
					KD.utils.Action.setQuestionValue('Mgr_Login ID', value);
					var MgmrElem = KD.utils.Util.getQuestionInput("Mgr_Login ID");
					KD.utils.Action._fireChange(MgmrElem);
                },
                setQstn:"OrigMgr_Login ID",
            }
                                               
        },
        //Where to append the table
        appendTo: function(){return $('[label="This Request is For"]');},
        //ID to give the table when creating it.
        resultsContainerId: 'reqForTable',
        before: function(){ //before search
          
        },
        success: function (){  //this is done when the search returns successfully                           
           
        },
        success_empty: function(){  //this is done when the search returns empty/no result. 
		    //Note that if this is empty, no result will "fail" silently
            alert("Your search criteria did not return any results, please check your criteria and try again.");
        },
        error: function(){  //This occurs if there is an error on the search      
        },

        dom: 'Bfrtip',
    },
    mgrConfig:{
        // type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
        type: "BridgeDataTable",
        // responsive: OPTIONAL Default for "BridgeDataTable" is true but can be over written.
        //responsive: false,
        bridgeConfig:{
            model: "People",
            qualification_mapping: "Enabled By Last Name",
            parameters: {'Last Name': '[label="Mgr Search By Last Name"] input'},
        },
        processSingleResult: true,
        // Properties in the data must match the attributes of the Bridge Request or have a "notdynamic" option set to true. This would be on
		// the same level as title and className
        data: {
            "Last Name":{
			    //This will be the title of the column or the label of the element, depending on the search type
                title:"Last Name",
				//This will be the class given to the column/cell/div as appropriate for the search type
                className: "all",
				//This is the menu label of the question to be set with the value from this column and row when a row is clicked.
                setQstn:"Mgr_Last Name",
            },
            "First Name":{
                title:"First Name",
				//For responsive datatables, a class of all always displays, none is in the subrow data (responsive data), and never is always hidden
				//For non-responsive datatables, a class of hidden will hide the column. see https://datatables.net/extensions/responsive/classes
				//for more details and options
                className: "all",
                setQstn:"Mgr_First Name"
            },
            "Login ID":{
                title:"Login ID",
                className: "all",
				//callback is also a valid option for type: "BridgeDataTable", "BridgeList". It happens when a row/item is selected
                callback:function(value){
					KD.utils.Action.setQuestionValue('Mgr_Login ID', value);
					var MgmrElem = KD.utils.Util.getQuestionInput("Mgr_Login ID");
					KD.utils.Action._fireChange(MgmrElem);
                },
                setQstn:"Mgr_Login ID",
            },
			"Company":{
                title:"Company",
                className: "all"
            },
			"Organization":{
                title:"Organization",
                className: "all"
            },
            "Department":{
                title:"Department",
                className: "all",
				setQstn:"Mgr_Department",
            },
            "Phone Number":{
                title:"Phone Number",
                className: "none",
                setQstn:"Mgr_Phone",
            },
           "E-mail":{
                title:"Email",
                className: "none",
                setQstn:"Mgr_Email",
            },
            "JobTitle":{
                title:"Job Title",
                className: "never",
                setQstn:"Mgr_JobTitle",
            },
            "Site":{
                title:"Location",
                className: "never",
                setQstn:"Mgr_Location",
            }
                                               
        },
        //Where to append the table
        appendTo: function(){return $('[label="Mgr Search Buttons"]');},
        //ID to give the table when creating it.
        resultsContainerId: 'MgrTable',
        before: function(){ //before search
            $('#searchMgr').prop('disabled',true);
            $('#spinner_searchMgr').show();
        },
        success: function (){
           $('#spinner_searchMgr').hide();
        },
        success_empty: function(){
            $('#spinner_searchMgr').hide();
            alert("Your search criteria did not return any results, please check your criteria and try again.");
        },
        error: function(){
           
        },
        complete: function(){
          
        },
        clickCallback: function(results){
            $('#searchMgr').prop('disabled',false);
            KD.utils.Action.setQuestionValue("Mgr Search By Last Name", "");
        },
        createdRow: function ( row, data, index ) {
        },
        dom: 'Bfrtip',
    },
    defaultMgrConfig:{
         // type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
        type: "BridgeGetSingle",
        // responsive: OPTIONAL Default for "BridgeDataTable" is true but can be over written.
        //responsive: false,
        bridgeConfig:{
            model: "People",
            qualification_mapping: "By Login ID",
            //Params to be created and passed to the Bridge.  VALUE MUST BE JQUERY SELECTOR if specified as a string.
			//This allows you to select values out of any element on the page, question or just dom element.
			//Otherwise, pass a function that returns the desired value. The function allows use of variables, etc.
			//Below is an example of getting the value out of a text question with jQuery (you could also use a function 
			//and KD.utils.Action.getQuestionValue) but getting a value out of a drop down list question is slightly 
			//different '[label="QuestionLabelHere"] select' 
            parameters: {'Login ID': '[label="Mgr_Login ID"] input'},
        },
        processSingleResult: true,
        // Properties in the data must match the attributes of the Bridge Request
        data: {
            "Last Name":{
                title:"Last Name",
                className: "all",
                setQstn:"Mgr_Last Name",
            },
            "First Name":{
                title:"First Name",
                className: "all",
                setQstn:"Mgr_First Name"
            },
            "Login ID":{
                title:"Login ID",
                className: "all",
                setQstn:"Mgr_Login ID",
            },
            "Company":{
                title:"Company",
                className: "all"
            },
            "Organization":{
                title:"Organization",
                className: "all"
            },
            "Department":{
                title:"Department",
                className: "all",
                setQstn:"Mgr_Department",
            },
            "Phone Number":{
                title:"Phone Number",
                className: "none",
                setQstn:"Mgr_Phone",
            },
            "E-mail":{
                title:"Email",
                className: "none",
                setQstn:"Mgr_Email",
            },
            "JobTitle":{
                title:"Job Title",
                className: "never",
                setQstn:"Mgr_JobTitle",
            },
            "Site":{
                title:"Location",
                className: "never",
                setQstn:"Mgr_Location",
            }
                                               
        },
        //Where to append the table
        appendTo: function(){return $('[label="Mgr Search Buttons"]');},
        //ID to give the table when creating it.
        resultsContainerId: 'MgrTable',
        before: function(){ //before search         
        },
        success: function (){  //This occurs when results are found     
        },
        success_empty: function(){  //This occurs when the search is successful, but no results are found                                             
        },
        error: function(){  //This occurs if there is an error on the search      
        },
        complete: function(){   //This occurs when the build of the table is complete  
        },
        clickCallback: function(results){  //This occurs on click
          
        },
        createdRow: function ( row, data, index ) { //This occurs when the row is being built
        },
        dom: 'Bfrtip',
    }
}


// Define Table objects or list Object and initialize them.
searchConfig ={
	listContact:{
		// type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
		type: "BridgeList",
		bridgeConfig:{
			//bridge model listed here
			model: "Person",
			//bridge qualification. This model/qualification must be exposed on the items/forms where this search is used.
			qualification_mapping: "By Full Name",
			//Params to be created and passed to the Bridge.  VALUE MUST BE JQUERY SELECTOR if specified as a string.
			//This allows you to select values out of any element on the page, question or just dom element.
			//Otherwise, pass a function that returns the desired value. The function allows use of variables, etc.
			//Below is an example of getting the value out of a text element on the page that is NOT a question, but
			//has an id of list-contact
			parameters: {'Full Name': '#list-contact input'},
				},
		// Properties in the data must match the attributes of the Bridge Request or have a "notdynamic" option set to true. This would be on
		// the same level as title and className
		data: {
			"First Name":{
			    //The title is in a separate div before the data with a class of title
				title:"First",
				//This is the menu label of the question to be set with the value from this column and row when a row is clicked.
				setQstn:"List Contact First Name",
				//This is added as a class to the div for both the title and the data (see example list below)
				className: "contactName",
			},
			"Last Name":{
				title:"Last",
				setQstn:"List Contact Last Name",
				className: "contactName"
			},
			"Email":{
				title:"Email",
				setQstn:"List Contact Email",
				//callback is also a valid option for type: "BridgeDataTable", "BridgeList". It happens when a row/item is selected
				callback:function(value){
					console.log(value);
				},
				className: "contactData"
			},
			"Login Id":{
				title:"Login",
				setQstn:"List Contact Login ID",
				className: "contactData"
			},
			"Work Phone Number":{
				title:"Phone",
				setQstn:"List Contact Phone",
				className: "contactData"
			},
		},
		//Where to append the table
		appendTo: '#list-contact-results',
		before: function(){ //before search
			//A function, not included here, to make the search unavailable
			toggleUnclickable($('#list-contact'));
		},
		success: function (){  //This occurs when results are found   
		    //this shows/unhides the appendTo element with features on the event
			this.appendTo.show("blind", "swing", 1000);
		},
		success_empty: function(){  //This occurs when the search is successful, but no results are found
			//an alert
			alert("No results Found");
		},
		error: function(){ //This occurs if there is an error on the search 
		    //make search available again (function not displayed here)
			toggleUnclickable($('#list-contact'));
		},
		complete: function(){ //This occurs when the build of the list is complete
			//make search available again (function not displayed here)
			toggleUnclickable($('#list-contact'));
		},
		clickCallback: function(results){  //This is what happens on selection/click of a list item--in addition to the setQstn 
				//put the name intothe list contact, someoneelse text input, hide list append to element.
				$('#list-contact .someoneelse input').val(results["First Name"]+ ' ' + results["Last Name"]);
				this.appendTo.hide("blind", "swing", 1000);
		},
	},
//The above would generate a result like this:	
//<div id="list-contact-results">
//<ul id="resultList">
//<li id="result">
//<div class="title contactName">First</div>
//<div>Allen</div>
//<div class="title contactName">Last</div>
//<div>Allbrook</div>
//<div class="title contactData">Email</div>
//<div>A.Allbrook@calbroservices.com</div>
//<div class="title contactData">Login</div>
//<div>Allen</div>
//<div class="title contactData">Phone</div>
//<div>1 212 555-5454 (11)</div>
//</li>
//</ul>
//</div>

	requestedForSDRTableConfig:{
		// type: "BridgeDataTable", "BridgeList", "BridgeGetSingle", or "performSDRTable".  Determines default values to be used and behavior.
		type: "performSDRTable",
		//simple data request config
		sdrConfig:{
		    //ID of the simple data request
			SDRId: 'KSHAA5V0HJEMVANZR2R0KM2F7LBICP',
			//parameter(s) for the search. This example pulls a value out of an text element on the page.
			//pulling one out of a question would look like return "lname="+KD.utils.Action.getQuestionValue("SDR Requested For");
			params: 
			//"lname=Peterson",
			function(){
				return "lname="+$('#SDR_requested_for input').val();
			},
			//Name of the simple data request
			sdrName: 'CallLastNameSDR'
		},
		// processSingleResult does the same thing as the click callback would do if there is just one result
		// found, rather than displaying the one row for the user to click on. For console tables or tables you
		// want to always display, even if there is just one record, this should be set to false.
		processSingleResult: true,
		//data elements must be elements/fields in the simple data request
		data: {
			"AR Login":{
				//This will be the title of the column or the label of the element, depending on the search type
				title:"Login ID",
				//This will be the class given to the column/cell/div as appropriate for the search type
				className: "all",
				//This is the menu label of the question to be set with the value from this column and row when a row is clicked.
				setQstn:"SDR_ReqFor_Login ID"
			},
			"First Name":{
				title:"First Name",
				//For responsive datatables, a class of all always displays, none is in the subrow data (responsive data), and never is always hidden
				//For non-responsive datatables, a class of hidden will hide the column. see https://datatables.net/extensions/responsive/classes
				//for more details and options
				className: "all",
				setQstn:"SDR_ReqFor_First Name"
			},
			"Last Name":{
				title:"Last Name",
				className: "min-tablet",
				setQstn:"SDR_ReqFor_Last Name"
			},
			"Supervisor Name":{
				title:"Manager Name",
				className: "none"
			},
		},
		//Where to append the table. This element should exist on the page
		//If a string is returned it will be processed as jQuery. Otherwise
		//return the element in a function.
		//appendTo: '#SDR_requested_for',
		appendTo: function(){return $('#SDR_requested_for');},
		//a string of the id to give the created table. This should not exist on the page.
		resultsContainerId: 'SDRRequestedForTable',
        before: function(){ //before search         
        },
        success: function (){  //This occurs when results are found     
        },
        success_empty: function(){  //This occurs when the search is successful, but no results are found    
			alert("No results Found");
        },
        error: function(){  //This occurs if there is an error on the search      
        },
        complete: function(){   //This occurs when the build of the table is complete  
        },
        clickCallback: function(results){  //This occurs when a row is clicked
		}
		createdRow: function ( row, data, index ) {  //This is done when the row is being built
		},
	}
};

