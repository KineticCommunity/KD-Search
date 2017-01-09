// Define Table objects or list Object and initialize them.
    requestedForTableConfig = {
        // type: "BridgeDataTable" or "BridgeList".  Determines default behavior and values to be used.
        type: "BridgeDataTable",
        // OPTIONAL - Default for "BridgeDataTable" is true but can be over written.
        responsive: false,
        // Kinetic Bridge Configuration
        bridgeConfig:{
            model: "Person",
            qualification_mapping: "By First Name or Last Name or Full Name",
            //Params to be passed to the Bridge.  Must be a string value, jQuery selector or function which returns a string value.
            parameters: {
              'Full Name': function(){return KD.utils.Action.getQuestionValue('Requested For');},
              'First Name': function(){return KD.utils.Action.getQuestionValue('Requested For');},
              'Last Name': function(){return KD.utils.Action.getQuestionValue('Requested For');}
            },
        },
        // OPTIONAL - Defaults to false.  If true and the single result returned, no results are displayed and behavior will mimic click of the single result.
        processSingleResult: true,
        // Properties in the data must match the attributes of the Bridge Request
        data: {
            "First Name":{
                // Table or List Title to display
                title:"FIRST NAME",
                // CSS Class to apply to results
                className: "all",
                // Question to be set upon value selection
                setQstn:"ReqFor_First Name",
                // callback for after the question is set upon result selection
                callback:function(value){
                    console.log(value);
                },
            },
            "Last Name":{
                title:"Last",
                className: "min-tablet",
                setQstn:"ReqFor_Last Name"
            },
            "Email":{
                title:"EMAIL",
                className: "min-phone",
                setQstn:"ReqFor_Email"
            },
            "Login Id":{
                title:"LOGIN",
                className: "none",
                setQstn:"ReqFor_Login ID"
            },
            "Work Phone Number":{
                title:"PHONE",
                className: "hidden",
                setQstn:"ReqFor_Phone"
            }
        },
        //Where to append the table. Must be a jQuery selector or function which returns a string value.
        appendTo: '#requested_for_results',
        //ID to give the table when creating it.
        resultsContainerId: 'requestedForTable',
        // OPTIONAL - Before search
        before: function(){
        },
        // OPTIONAL - After search was successful
        success: function (){
        },
        // OPTIONAL - After search was successful but there are no results
        success_empty: function(){
            alert("No results Found");
        },
        // OPTIONAL - The search resulted in error
        error: function(){
        },
        // OPTIONAL - After search is complete and results are displayed
        complete: function(){
        },
        // OPTIONAL - After a row or list item is clicked
        clickCallback: function(results){
          // set the Requsted For question with the selected First and Last Name
          KD.utils.Action.setQuestionValue('Requested For',results["First Name"]+' '+results["Last Name"]);
        },
    };
