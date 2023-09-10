sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,ValueHelpDialog) {
	"use strict";

	return BaseController.extend("configuringnews.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel;

			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
			});
			this.setModel(oViewModel, "worklistView");
			
			// Agregar eventos de cambio a los campos de entrada para activar el filtrado
			//this.getView().byId("InputS1").attachLiveChange(this._applyFilters, this);
			this.getView().byId("InputS2").attachLiveChange(this._applyFilters, this);
			this.getView().byId("InputS3").attachLiveChange(this._applyFilters, this);
			this.getView().byId("InputS4").attachLiveChange(this._applyFilters, this);
			this.getView().byId("InputS5").attachLiveChange(this._applyFilters, this);
			this.getView().byId("InputS6").attachLiveChange(this._applyFilters, this);
			this.getView().byId("InputS7").attachLiveChange(this._applyFilters, this);

			var oTable = this.getView().byId("table");
    		sap.ui.getCore().setModel(oTable, "worklistTable");

			
			/*switch (sPriority) {
				case "Baja":
					oText.addStyleClass("priorityLow");
					break;
				case "Media":
					oText.addStyleClass("priorityMedium");
					break;
				//... y así sucesivamente para los otros casos
			}*/
		},onStatusFilterChange:function(oEvent){

			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			// Obtener la referencia a la tabla y su modelo de enlace
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("items");
			
			if (sSelectedKey) {
				// Aplicar filtro basado en la clave seleccionada
				var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, sSelectedKey);
				oBinding.filter([oFilter]);
			} else {
				// Si no hay clave seleccionada, limpiar el filtro
				oBinding.filter([]);
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);

			var oTable = this.byId("table");
			var aItems = oTable.getItems();

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				var oBindingContext = oItem.getBindingContext();
				if (oBindingContext) {
					var oData = oBindingContext.getObject();
					var sPriority = oData.priority;
					var sTatus = oData.status;

					var oPriorityControl = oItem.getCells()[6]; // reemplaza X por el índice del control que muestra la prioridad

					// Elimina las clases anteriores en caso de que se apliquen múltiples veces
					oPriorityControl.removeStyleClass("priorityLow");
					oPriorityControl.removeStyleClass("priorityMedium");
					oPriorityControl.removeStyleClass("priorityHigh");
					oPriorityControl.removeStyleClass("priorityUrgent");
					oPriorityControl.removeStyleClass("priorityCritical");

					switch(sPriority) {
						case "1": 
							oPriorityControl.addStyleClass("priorityLow");
							break;
						case "2":
							oPriorityControl.addStyleClass("priorityMedium");
							break;
						case "3":
							oPriorityControl.addStyleClass("priorityHigh");
							break;
						case "4":
							oPriorityControl.addStyleClass("priorityUrgent");
							break;
						case "5":
							oPriorityControl.addStyleClass("priorityCritical");
							break;
					}
					var oPriorityControl = oItem.getCells()[8]; // reemplaza X por el índice del control que muestra la prioridad

					// Elimina las clases anteriores en caso de que se apliquen múltiples veces
					oPriorityControl.removeStyleClass("statusBorrador");
					oPriorityControl.removeStyleClass("statusDesplegada");
					oPriorityControl.removeStyleClass("statusCancelada");

					switch(sTatus) {
						case "BO": 
							oPriorityControl.addStyleClass("statusBorrador");
							break;
						case "DE":
							oPriorityControl.addStyleClass("statusDesplegada");
							break;
						case "CA":
							oPriorityControl.addStyleClass("statusCancelada");
							break;
					}
				}
			}

		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * Navigate back in the browser history
		 * @public
		 */
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},


		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("description", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		addRow_New :function (oEvent) {
			var controllerW = this;
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---worklist").getController();
			var sObjectId = controllerW.onGetHash()
			var sObjectIdContent = controllerW.onGetHashGuion()
			this.getOwnerComponent().getRouter().navTo("detaNew", {
				objectId: sObjectId,
				objectIdContent: sObjectIdContent,
			});
		},
		onListItemPress : function (oEvent) {
			 // obtén el ListItem que fue seleccionado
			 //var controllerW = sap.ui.getCore().byId("container-configuringnews---worklist").getController();
			 var oListItem = oEvent.getSource();
			 
			 // obtén el contexto de los datos ligados al ListItem
			 var oBindingContext = oListItem.getBindingContext();
		 
			 // obtén la entidad del ListItem (esto contendrá todos los datos del objeto seleccionado)
			 var oEntity = oBindingContext.getObject();
		 
			 // obtén el ID del objeto seleccionado. Suponiendo que tu entidad tiene un atributo llamado 'id'
			 var sObjectId = oEntity.id;
			 var sObjecttype = oEntity.type;
			 var sObjectarea = oEntity.area;
			 var sObjectpriority = oEntity.priority;
			 var sObjectstatus = oEntity.status;
			 var sObjecttitle = oEntity.title;
			 var sObjectsubtitle = oEntity.subtitle;
			 var sObjectdescription = oEntity.description;
			 // navega a la vista de detalle pasando el objeto ID en la ruta
			this.getOwnerComponent().getRouter().navTo("informative", {
				objectId: sObjectId,
				objecttype: sObjecttype,
				objectarea: sObjectarea,
				ojectpriority: sObjectpriority,
				objectstatus:sObjectstatus,
				objecttitle:sObjecttitle,
				objectsubtitle:sObjectsubtitle,
				objectdescription:sObjectdescription
			});
		},onListItemConfigPress:function(oEvent){
			// obtén el ListItem que fue seleccionado
			var controllerW = this;
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---worklist").getController();
			var sObjectIdContent = controllerW.onGetHashGuion();
			var oListItem = oEvent.getSource();
			
			// obtén el contexto de los datos ligados al ListItem
			var oBindingContext = oListItem.getBindingContext();
		
			// obtén la entidad del ListItem (esto contendrá todos los datos del objeto seleccionado)
			var oEntity = oBindingContext.getObject();
		
			// obtén el ID del objeto seleccionado. Suponiendo que tu entidad tiene un atributo llamado 'id'
			var sObjectId = oEntity.id;
			var sObjecttype = oEntity.type;
			var sObjectarea = oEntity.area;
			var sObjectpriority = oEntity.priority;
			var sObjectstatus = oEntity.status;
			var sObjecttitle = oEntity.title;
			var sObjectsubtitle = oEntity.subtitle;
			var sObjectdescription = oEntity.description;

		   this.getOwnerComponent().getRouter().navTo("detai", {
			objectId: sObjectId,
			objectIdContent: sObjectIdContent,
			objecttype: sObjecttype,
			objectarea: sObjectarea,
			ojectpriority: sObjectpriority,
			objectstatus:sObjectstatus,
			objecttitle:sObjecttitle,
			objectsubtitle:sObjectsubtitle,
			objectdescription:sObjectdescription
		});
		}
		,

		_applyFilters: function() {
			// Obtener los valores de los campos de entrada
			//var sInputS1Value = this.getView().byId("InputS1").getValue();
			var sInputS2Value = this.getView().byId("InputS2").getValue();
			var sInputS3Value = this.getView().byId("InputS3").getValue();
			var sInputS4Value = this.getView().byId("InputS4").getValue();
			var sInputS5Value = this.getView().byId("InputS5").getValue();
			var sInputS6Value = this.getView().byId("InputS6").getValue();
			var sInputS7Value = this.getView().byId("InputS7").getValue();

			// Crear los filtros basados en los valores de los campos de entrada
			var aFilters = [];
			if (sInputS2Value) {
				aFilters.push(new Filter("title", FilterOperator.Contains, sInputS2Value));
			}
			if (sInputS3Value) {
				aFilters.push(new Filter("createdBy", FilterOperator.Contains, sInputS3Value));
			}
			if (sInputS4Value) {
				aFilters.push(new Filter("subtitle", FilterOperator.Contains, sInputS4Value));
			}
			if (sInputS5Value) {
				aFilters.push(new Filter("area", FilterOperator.Contains, sInputS5Value));
			}
			if (sInputS6Value) {
				aFilters.push(new Filter("description", FilterOperator.Contains, sInputS6Value));
			}
			if (sInputS7Value) {
				aFilters.push(new Filter("status", FilterOperator.Contains, sInputS7Value));
			}

			var oTable = this.getView().byId("table");
			// Obtener el binding de la tabla y aplicar los filtros
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},formatter: {
			marginLeft10: function() {
				return new sap.ui.layout.MarginInfo({left: 10});
			}
		},
		
		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
					objectId_Old: oItem.getBindingContext().getProperty("code"),
					objectId : sObjectPath.slice("/News".length) // /Products(3)->(3)
				});
			});
		},
		onDeleteRecordPress: function(oEvent) {
			// Obtenemos el contexto del objeto seleccionado
			var oContext = oEvent.getSource().getBindingContext();
		
			// Aquí, supongo que tu entidad tiene un atributo "id", si es diferente, cambia "id" por el nombre correcto
			var sId = oContext.getProperty("id");
			
			// A continuación, puedes llamar a una función que gestione la eliminación
			this.deleteRecordById(sId);
		},
		deleteRecordById: function(sId) {
			var that  = this;
			var oModel = this.getView().getModel(); // Asume que estás usando el modelo OData por defecto
		
			//var oModel = this.getOwnerComponent().getModel();
					var path = "/News"+"('"+sId+"')"
					oModel.remove(path, {
							success: function (oData, response) {
								//Se deberia actualizar
								var texto = that.getResourceBundle().getText("DeleteSucce");
								sap.m.MessageToast.show(texto);
								//oModel.refresh(true); //.
							},
							error: function (oError) {
									var texto = that.getResourceBundle().getText("DeleteFailed");
									sap.m.MessageToast.show(texto)
							}
						}
					);
		},
		

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		formatType: function (sKey) {
            var mTypes = {
                "NOT": "Notes",
                "PDF": "PDF",
                "GRA": "KPI"
                // ... añade otros si es necesario
            };
            return mTypes[sKey] || sKey;
        },

        formatStatus: function (sKey) {
            var mStatus = {
                "BO": "Borrador",
                "DE": "Desplegada",
                "CA": "Cancelada"
                // ... añade otros si es necesario
            };
            return mStatus[sKey] || sKey;
        },

		formatPriorityText: function(sPriority) {
			var sText;
		
			switch(sPriority) {
				case "1": 
					sText = "Baja";
					break;
				case "2":
					sText = "Media";
					break;
				case "3":
					sText = "Alta";
					break;
				case "4":
					sText = "Urgente";
					break;
				case "5":
					sText = "Crítica";
					break;
				default:
					sText = "";
					break;
			}
		
			return sText;
		}	
	});
});