/**
KD Search RE Edition

**Completed 1/14/2016 Brian Peterson

- Added consistency in code between RE and CE versions.
- Corrected appendTo property use to use resultsContainer
- Updates to function performBridgeRequestList for consistency with CE version

**TODO
- clear table and list when performing search.  Currently results stay when running the search.  IE one results returned in second search.

**/
(function($) {
    // createcreate the KDSearch global object
	KDSearch = typeof KDSearch == "undefined" ? {} : KDSearch;
    // Create a scoped alias to simplify references
    var search = KDSearch;
   
    /**
     * Define default properties for the Search configurations
     * Reduces need to include all properties in a search configuration.  
     * Each Search config my overide these values by including a value of its own.
     * execute: {Function} Function which will execute the search
     * Other properties are used by Datatables.net or its Responsive Plugin.
     */
    /* Define default properties for defaultsBridgeDataTable object. */
    var defaultsBridgeDataTable = {
        execute: performBridgeRequestDataTable,
		resultsContainer : '<table cellspacing="0", border="0", class="display">',
        bridgeConfig:{
			templateId: BUNDLE.config.commonTemplateId
		},
		// Properties specific to DataTables
		paging: true,
        info: true,
        searching: true,
		responsive: {
            details: {
                type: 'column',
            }
		},
    };
    
    /* Define default properties for defaultsBridgeList object. */
    var defaultsBridgeList = {
        execute: performBridgeRequestList,
		resultsContainer : '<div">',
    };
    
    /* Define default properties for defaultsBridgeGetSingle object. */
    var defaultsBridgeGetSingle = {
        execute: performBridgeRequestSingle,
		bridgeConfig:{
			templateId: BUNDLE.config.commonTemplateId
		},
    };
    
    /* Define default properties for defaultSDRTable object. */
    var defaultSDRTable = {
        execute: performSDRTable,
		resultsContainer : '<table cellspacing="0", border="0", class="display">',
		// Properties specific to DataTables
		responsive: {
			details: {
				type: 'column',
			}
		},
    };

    
    /**
     * Executes the search for the configured search object.
     * @param {Obj} Search configuration object.
	 * @param {Ojb} Configuration object to over ride first param.
     */
	search.executeSearch = function(searchObj1, searchObj2) {
		var configObj=$.extend( true, {}, searchObj1, searchObj2 );
		configObj = search.initialize(configObj);
		if(configObj.execute){
			configObj.execute();
		}	
    };

    /**
     * Initialize the searchConfig Object 
     * @param {Object} Configuration object(s)
     */
    search.initialize = function(obj){
        // Initialize each the configurations based on the type property 
            if(obj.type=="BridgeDataTable"){
                // Entend defaults into the configuration
                obj=$.extend( {}, defaultsBridgeDataTable, obj );
                // Create a table element for Datatables and add to DOM
				obj=initializeResultsContainer(obj);  
            }
            else if(obj.type=="BridgeList"){
                // Entend defaults into the configuration
                obj=$.extend( {}, defaultsBridgeList, obj );
                // Create a results element for Datatables and add to DOM
				obj=initializeResultsContainer(obj); 
            }
            else if(obj.type=="BridgeGetSingle"){
                // Entend defaults into the configuration
                obj=$.extend( {}, defaultsBridgeGetSingle, obj );
            } 
            else if(obj.type=="performSDRTable"){
                // Entend defaults into the configuration
                obj=$.extend( {}, defaultSDRTable, obj );
                // Create a table element for Datatables and add to DOM
				obj=initializeResultsContainer(obj);  
            }
			return obj
    }
	
    /**
     * Used to execute objects configured as defaultBridgeDataTable
     */
     function performBridgeRequestDataTable(){
		var configObj = this;
		if(configObj.before	){configObj.before();};
		convertDataToColumns(configObj);
		//Retrieve and set the Bridge parameter values using JQuery
        var parameters = {};
		$.each(configObj.bridgeConfig.parameters, function(i,v){
            if(typeof v == "function"){
				parameters[i] = v();
			}
			if(typeof v == "string"){
				parameters[i]=$(configObj.bridgeConfig.parameters[i]).val();
			}
		});
		// Retrieve Bridge Search Attributes from Search Object
		if(typeof configObj.bridgeConfig.attributes == "undefined"){
			configObj.bridgeConfig.attributes = [];
			$.each(configObj.data, function( k, v ){
				configObj.bridgeConfig.attributes.push(k)
			});
		}
        var templateId = (configObj.bridgeConfig.templateId && configObj.bridgeConfig.templateId!="null") ? configObj.bridgeConfig.templateId : clientManager.templateId;
        //create the connector necessary to connect to the bridge
        var connector = new KD.bridges.BridgeConnector({templateId: templateId});
		connector.search(configObj.bridgeConfig.model, configObj.bridgeConfig.qualification_mapping, {
			parameters: parameters,
			attributes: configObj.bridgeConfig.attributes,
			success: function(response) {
				configObj.dataArray = [];
				//Retrieve Records
				configObj.records=response.records;
				if(configObj.records.length > 0 || !configObj.success_empty){
					// Execute success callback
					if(configObj.success){configObj.success();}
					// Only one record returned
					if(typeof configObj.processSingleResult != "undefined" && configObj.processSingleResult && configObj.records.length == 1){
						// TODO: can this code be placed into a function and also used with performBridgeRequestSingle.  Note: response is different
						// in each scenario and will need to be accounted for in the code.
						var resultsObj = {};
						// Iterate through the data configuration of the search object
						$.each(configObj.data, function( k, v ){
							// Check for Bridge Search response that correlates to the key
							if (typeof configObj.records[0].attributes[k] != "undefined"){
								// Set objVal to the value resturned by the bridge
								var objVal = configObj.records[0].attributes[k];
							}
							else{
								var objVal = '';
							}
							resultsObj[k] = objVal;
						});
						setValuesFromResults(configObj.data, resultsObj);
						if(configObj.clickCallback){configObj.clickCallback(resultsObj);}
					}
					// More than 1 record returned
					else if(typeof configObj.processSingleResult == "undefined" || !configObj.processSingleResult ||configObj.records.length > 1){    
						//Iterate through row results to retrieve data
						$.each(configObj.records, function(i,record){
							var obj = {};
							//Iterate through the configured columns to match with data returned from bridge
							$.each(configObj.data, function(attribute, attributeObject){
								if (typeof record.attributes[attribute] != "undefined"){
									if (attributeObject["date"] == true && typeof attributeObject["moment"] != "undefined") {
										if (record.attributes[attribute] != "") {
											var attributeValue = moment(record.attributes[attribute]).format(attributeObject["moment"]);
										} else {
											var attributeValue = record.attributes[attribute];
										}
									} else {
										var attributeValue = record.attributes[attribute];
									}
								}
								else{
									var attributeValue = '';
								}
								obj[attribute] = attributeValue;
							});
							configObj.dataArray.push(obj);

						});
						// Append Column to beginning of table contain row expansion for responsive Plugin
						if(configObj.responsive){
							configObj.columns.unshift({
								defaultContent: '',
								className: 'control',
								orderable: false,
							});
						}
						// Create DataTable Object.
						createDataTable(configObj);
					}
				}
				// No records returned
				else{
					if(configObj.success_empty){configObj.success_empty();}
				}
				if(configObj.complete){configObj.complete();}
			},
			error: function(response) {
				if(configObj.error){configObj.error();}
				if(configObj.complete){configObj.complete();}
			}
		}); 													
    }	

    /**
     * Used to execute objects configured as performBridgeRequestSingle
     */
    function performBridgeRequestSingle(){
        var configObj = this;
		if(configObj.before){configObj.before();}
        //Retrieve and set the Bridge parameter values using JQuery
        var parameters = {};
        $.each(configObj.bridgeConfig.parameters, function(i,v){
            if(typeof v == "function"){
				parameters[i] = v();
			}
			if(typeof v == "string"){
				parameters[i]=$(configObj.bridgeConfig.parameters[i]).val();
			}
        });
		// Retrieve Bridge Search Attributes from Search Object
		if(typeof configObj.bridgeConfig.attributes == "undefined"){
			configObj.bridgeConfig.attributes = [];
			$.each(configObj.data, function( k, v ){
//				v.hasOwnProperty('attribute') && configObj.bridgeConfig.attributes.push(v['attribute'])
				configObj.bridgeConfig.attributes.push(k)
			});
		}
        var templateId = (configObj.bridgeConfig.templateId && configObj.bridgeConfig.templateId!="null") ? configObj.bridgeConfig.templateId : clientManager.templateId;
        //create the connector necessary to connect to the bridge
        var connector = new KD.bridges.BridgeConnector({templateId: templateId});
        //CONFIGURE: Id of table (div) to recieve Bridge results.  The table element must exist before this code executes.
		connector.retrieve(configObj.bridgeConfig.model, configObj.bridgeConfig.qualification_mapping, {
			//parameters: parameters,
			parameters: parameters,
			metadata: configObj.bridgeConfig.metadata,
			//attributes: configObj.bridgeConfig.attributes,
			attributes: configObj.bridgeConfig.attributes,
			//TODO: Move Success into object configuration????  Does it make sense?
			success: function(response) {
				//Retrieve Records
				configObj.records=response.attributes;
				if(response.attributes != null || !configObj.success_empty){
					// Execute success callback
					if(configObj.success){configObj.success();}
					configObj.dataArray = [];
					var obj = {};
					// Iterate through the data configuration of the search object
					$.each(configObj.data, function( k, v ){
						// Check for Bridge Search response that correlates to the key
						if (typeof response.attributes[k] != "undefined"){
							// Set objVal to the value resturned by the bridge
							var objVal = response.attributes[k];
							// If "setQstn" configuration exist
							if(typeof v["setQstn"] != "undefined" && v["setQstn"]!=""){
								KD.utils.Action.setQuestionValue(v["setQstn"],objVal);
							}
							// If "callback" exists
							if(typeof v["callback"] != "undefined" && v["callback"]!=""){
								v['callback'](response.attributes[k])
							}
						}
						else{
							var objVal = '';
						}

						obj[k] = objVal;
					});
					configObj.dataArray.push(obj);
				}
				else{
					if(configObj.success_empty){configObj.success_empty();}
				}
				if(configObj.complete){configObj.complete();}
			},
			error: function(response){
				if(configObj.error){configObj.error();}
				if(configObj.complete){configObj.complete();}
			}
		});
    }

    /**
     * Used to execute objects configured as defaultBridgeList
     */
    function performBridgeRequestList(){
        var configObj = this;
		if(configObj.before){configObj.before();};
        //Retrieve and set the Bridge parameter values using JQuery
        var parameters = {};
        $.each(configObj.bridgeConfig.parameters, function(i,v){
            if(typeof v == "function"){
				parameters[i] = v();
			}
			if(typeof v == "string"){
				parameters[i]=$(configObj.bridgeConfig.parameters[i]).val();
			}
		});
		// Retrieve Bridge Search Attributes from Search Object
		if(typeof configObj.bridgeConfig.attributes == "undefined"){
			configObj.bridgeConfig.attributes = [];
			$.each(configObj.data, function( k, v ){
				configObj.bridgeConfig.attributes.push(k)
			});
		}
        var templateId = (configObj.bridgeConfig.templateId && configObj.bridgeConfig.templateId!="null") ? configObj.bridgeConfig.templateId : clientManager.templateId;
        //create the connector necessary to connect to the bridge
        var connector = new KD.bridges.BridgeConnector({templateId: templateId});
		connector.search(configObj.bridgeConfig.model, configObj.bridgeConfig.qualification_mapping, {
            parameters: parameters,
            attributes: configObj.bridgeConfig.attributes,
            success: function(response) {
                var self = this; // reference to this in current scope
                //Retrieve Records
                configObj.records=response.records;
				if(configObj.records.length > 0 || !configObj.success_empty){
					// Execute success callback
					if(configObj.success){configObj.success();}
       				// Only one record returned
					if(typeof configObj.processSingleResult != "undefined" && configObj.processSingleResult && configObj.records.length == 1){
						setValuesFromResults(configObj.data,  configObj.records[0].attributes);
					}
					// More than 1 record returned
					else if(typeof configObj.processSingleResult == "undefined" || !configObj.processSingleResult ||configObj.records.length > 1){    
	                    this.$resultsList = $("<ul id='resultList'>");
						//Iterate through row results to retrieve data
	                    $.each(configObj.records, function(i,record){
							self.$singleResult = $("<li id='result'>");
							//Iterate through the configured columns to match with data returned from bridge
	                        $.each(configObj.data, function(attribute, attributeObject){
								if (typeof record.attributes[attribute] != "undefined"){
	                                var title ="";
									if(attributeObject["title"]){
										var $title = $('<div>', {class: "title " + attributeObject['className']}).html(attributeObject["title"]);
										self.$singleResult.append($title);
									}
									if (attributeObject["date"] == true && typeof attributeObject["moment"] != "undefined") {
										if (record.attributes[attribute] != "") {
											var attributeValue = moment(record.attributes[attribute]).format(attributeObject["moment"]);
										} else {
											var attributeValue = record.attributes[attribute];
										}
	                                } else {
	                                    //var attributeValue = record.attributes[attribute];
										var $value = $('<div>', {class: attributeObject["className"]}).html(record.attributes[attribute]);
										self.$singleResult.append($value); 
										self.$singleResult.data(attribute,record.attributes[attribute])
	                                }
	                            }
	                            else{
	                            self.$singleResult.append($('<div>'));
								}
							});
							self.$resultsList.append(self.$singleResult);
	                    });
						configObj.resultsContainer.empty().append(this.$resultsList);
						configObj.resultsContainer.off().on( "click", 'li', function(event){
							setValuesFromResults(configObj.data, $(this).data());
							if(configObj.clickCallback){configObj.clickCallback($(this).data());};
							configObj.resultsContainer.empty();
						});
					}
				}       
				else{
					if(configObj.success_empty){configObj.success_empty();}
				}
				if(configObj.complete){configObj.complete();} 
            },
			error: function(response){
				if(configObj.error){configObj.error();}
				if(configObj.complete){configObj.complete();}
			}
        }); 
    }
    
    /**
     * Used to execute objects configured as performSDRTable
     */
    function performSDRTable(){
        var configObj = this;
		if(configObj.before){configObj.before();};
		convertDataToColumns(configObj);
        var SDRId = configObj.sdrConfig.SDRId;
        var sdrName = configObj.sdrConfig.sdrName;
        // Evaluate params if a function
		if(typeof configObj.sdrConfig.params == "function"){
			var params = configObj.sdrConfig.params();//.val();
		}
		else if(typeof configObj.sdrConfig.params == "string"){
			var params = configObj.sdrConfig.params;
		}
        //    Define a callback that will call the custom populateUserTable function on success, or alert on failure. 
        var connection=new KD.utils.Callback(function(response){
            configObj.dataArray = [];
            //Retrieve Records
            configObj.records=KD.utils.Action.getMultipleRequestRecords(response);
			if(configObj.records.length > 0 || !configObj.success_empty){
			// Execute success callback
			if(configObj.success){configObj.success();}
            // More than 1 record returned
				if(typeof configObj.processSingleResult == "undefined" || !configObj.processSingleResult || (configObj.records.length > 1 && configObj.records != null)){    
					//Loop through row results to retrieve data
					$.each(configObj.records, function(i,record){
						var obj = {};
						$.each(configObj.columns, function( j, v ){
							var objKey = v["data"];
							if (typeof KD.utils.Action.getRequestValue(record, objKey) != "undefined"){
								if (v["date"] == true && typeof v["moment"] != "undefined") {
								    if (objVal != "") {
										var objVal = moment(KD.utils.Action.getRequestValue(record, objKey)).format(v["moment"]);
									} else {
										var objVal = KD.utils.Action.getRequestValue(record, objKey);
									}
								} else {
									var objVal = KD.utils.Action.getRequestValue(record, objKey);
								}
							}
							else{
								var objVal = '';
							}
							obj[objKey] = objVal;
						});
						configObj.dataArray.push(obj);
					});
					// Append Column to beginning of table contain row expansion for responsive Plugin
					if(configObj.responsive){
						configObj.columns.unshift({
							defaultContent: '',
							className: 'control',
							orderable: false,
						});
					}
					// Create DataTable Object.
					createDataTable(configObj);
				}
				// Only one record returned
				else if(typeof configObj.processSingleResult != "undefined" && configObj.processSingleResult && configObj.records.length == 1 && configObj.records != null){
					// TODO: can this code be placed into a function and also used with performBridgeRequestSingle.  Note: response is different
					// in each scenario and will need to be accounted for in the code.
					var resultsObj = {};
					// Iterate through the data configuration of the search object
					$.each(configObj.records, function(i,record){
						var obj = {};
						$.each(configObj.columns, function( j, v ){
							var objKey = v["data"];
							if (typeof KD.utils.Action.getRequestValue(record, objKey) != "undefined"){
								if (v["date"] == true && typeof v["moment"] != "undefined") {
									var objVal = moment(KD.utils.Action.getRequestValue(record, objKey)).format(v["moment"]);
								} else {
									var objVal = KD.utils.Action.getRequestValue(record, objKey);
								}
							}
							else{
								var objVal = '';
							}
							resultsObj[objKey] = objVal;
						});
					});
					setValuesFromResults(configObj.data, resultsObj);
					if(configObj.clickCallback){configObj.clickCallback(resultsObj);}
				}
			}
			else{
                if(configObj.success_empty){configObj.success_empty();};
            }
			if(configObj.complete){configObj.complete();};
        },function(response){
			if(configObj.complete){configObj.complete();}
			if(configObj.error){configObj.error();}
		}); 
        // Make an Asynchronous SDR request. 
        KD.utils.Action.makeAsyncRequest(sdrName, SDRId, connection, params, '', false);
    } 
    
    /**
     * Code in kd_client.js is preventing the backspace from working on $('.dataTables_filter input'). stopPropigation allows backspace to work.  
     */
    $('body').on('keydown', '.dataTables_filter input', function( event ) {
      event.stopPropagation();
    });
    

   	/****************************************************************************
								PRIVATE HELPERS / SHARED FUNCTIONS							   
	****************************************************************************/


    /**
     * Set Values from selected row
	 * @params {Object} data config object
	 * @params {Object} data returned from selection.
     */
    function setValuesFromResults(configData, results){ //rowCallback
        $.each(configData, function( k, v){
            if(v[	"setQstn"]!="" && typeof v["setQstn"] != "undefined"){
				KD.utils.Action.setQuestionValue(v["setQstn"],results[k]);
            }
			// If callback property exists
			if(v.callback){v.callback(results[k]);}
        });
    }

    /**
     * Returns Search Object
	 * Creates resultsContainer and adds it to DOM based on Search Config
     * @param {Object} Search Object
     */	
	function initializeResultsContainer(obj){
		// Create resultsContainer
		if(typeof obj.resultsContainer == "string"){ // if string
			obj.resultsContainer = $(obj.resultsContainer).attr('id',obj.resultsContainerId);
		}
		else if(typeof obj.resultsContainer == "function"){ // if function
			obj.resultsContainer = obj.resultsContainer().attr('id',obj.resultsContainerId);
		}
		// Append to DOM
		if(obj.appendTo instanceof $){ // if jQuery Obj
			obj.appendTo.append(obj.resultsContainer);
		}
		else if(typeof obj.appendTo == "string"){ // if string
			obj.appendTo = $(obj.appendTo).append(obj.resultsContainer);
		}
		else if(typeof obj.appendTo == "function"){ // if function
			obj.appendTo = obj.appendTo().append(obj.resultsContainer);
		}
		return obj;
	}
	
	/**
     * Returns object containing data from row
     * @param {Object} table
	 * @param {Object} row 
     */
	function dataTableRowToObj(table, row){
		var selectedRow = $(row).closest('tr');		
		return table.row(selectedRow).data();
	}

	/**
	* Convert the "data" property into "columns", necessary for DataTables.
	* @param {Object} Search Object to convert
	*/
	function convertDataToColumns(obj){
		obj.columns = [];		
		$.each(obj.data, function(attribute, attributeObject){
			attributeObject["data"] = attribute;
			obj.columns.push(attributeObject)
		});
    }
	
	/**
	* Create a TableTable using a Search Object
	* @param {Object} Search Object used to create the DataTable
	*/
	function createDataTable(configObj){
		configObj.tableObj = $('#'+configObj.resultsContainerId).DataTable( configObj );
		configObj.tableObj.rows.add(configObj.dataArray).draw();
		// Bind Click Event based on where the select attribute extists ie:<tr> or <td>
		$('#'+configObj.resultsContainerId).off().on( "click", 'td', function(event){
			// Ensure user has not clicked on an element with control class used by the responsive plugin to expand info
			if(!$(this).hasClass('control')){
				// Get closest row which is a parent row.
				var row = $(this).closest('tr');
				if(row.hasClass('child')){
					row = row.prev('tr.parent')
				}
				// Convert selected row into a Results Obj 
				var resultsObj = dataTableRowToObj(configObj.tableObj, row);
				// Set results based on Search config
				setValuesFromResults(configObj.data, resultsObj);
				if(configObj.clickCallback){configObj.clickCallback(resultsObj);}
				// Destroy DataTable and empty in case columns change.
				configObj.tableObj.destroy();
				$('#'+configObj.resultsContainerId).empty();
			}
		});
	}
	
	/****************************************************************************
								PUBlIC FUNCTIONS							   
	****************************************************************************/
	
	/**
     * Returns string with uppercase first letter
     * @param {String} Value to be give uppercase letter
     */
    search.ucFirst = function(str){
        var firstLetter = str.substr(0, 1);
        return firstLetter.toUpperCase() + str.substr(1);
    }
})(jQuery);
