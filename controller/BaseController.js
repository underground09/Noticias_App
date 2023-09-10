sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
], function (Controller, UIComponent, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;
	var lvIdNew = null;  
	var lvIdContent = null; 
	var oOriginalContent = null; 
	var oOriginalHeader = null; 

	return Controller.extend("configuringnews.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress : function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		/* Internal routine*/
		setIdNew: function(newId) {
            lvIdNew = newId;
        },

        getIdNew: function() {
            return lvIdNew;
        },
		setIdContent: function(newId) {
            lvIdContent = newId;
        },

        getIdContent: function() {
            return lvIdContent;
        },
		onGetHash: function () {
			var caracteres = '0123456789abcdefghijklmnopqrstuvwxyz'
			var longitud = 32
			var hash = ''
		  
			for (var i = 0; i < longitud; i++) {
			  var indice = Math.floor(Math.random() * caracteres.length);
			  hash += caracteres.charAt(indice);
			}
		  
			return hash;
		  },
		  onGetHashGuion: function() {
			var caracteres = '0123456789abcdef';  // Solo caracteres hexadecimales
			var longitud = [8, 4, 4, 4, 12];  // Longitudes de cada sección
			var hash = '';
			
			for (var seccion of longitud) {
				for (var i = 0; i < seccion; i++) {
					var indice = Math.floor(Math.random() * caracteres.length);
					hash += caracteres.charAt(indice);
				}
				hash += '-';
			}
			
			return hash.slice(0, -1);  // Elimina el último guión
		},content_has_son: function(oModel, hash, position) {
			return new Promise((resolve, reject) => {
				 // Si la posición es 0, resuelve la promesa con 0 inmediatamente
				 if (position === 0) {
					resolve(0);
					return;  // Retorna para asegurarte de que el código siguiente no se ejecute
				}
				var path = "/News" + "('" + hash + "')/content?$count=true";
				oModel.read(path, {
					success: function (oData, response) {
						resolve(oData.results.length);  // Usa resolve para devolver el valor
					},
					error: function(oError) {
						resolve(oError);  // Maneja el error
					}   
				});
			});
		},check_type_pdf:function(oModel, hash1, hash2){
			return new Promise((resolve, reject) => {
				var path = "/News" + "('" + hash1 + "')/content";
			
				oModel.read(path, {
					success: function(oData, response) {
						if (oData && oData.results) {
							var pdfCount = 0;  // Contador para registros con tipo "PDF"
							var targetIsPDF = false; // Bandera para saber si el registro target es un PDF
							
							// Itera sobre pdfItems
							for (var i = 0; i < oData.results.length; i++) {
								var item = oData.results[i];
								if (item.content_type === "PDF") {
									pdfCount++;
								}
								if (item.id === hash2) {
									targetIsPDF = (item.content_type === "PDF");
								}
							}
			
							if (!targetIsPDF && pdfCount >= 1) {
								// El registro con id=hash2 no es un PDF, y ya hay al menos un registro PDF existente.
								resolve(false);
							} else if (targetIsPDF && pdfCount > 1) {
								// El registro con id=hash2 es un PDF, y hay otro registro PDF en la lista.
								resolve(false);
							} else {
								resolve(true);
							}
						} else {
							// Si no hay resultados, asumimos que se puede actualizar
							resolve(true);
						}
					},
					error: function(oError) {
						reject(oError);  // Maneja el error
					}   
				});
			});				
		},		
		getCurrentDateIsoFormat: function() {
			var currentDate = new Date();
			var currentDateIso = currentDate.toISOString();
			return currentDateIso;
		},
		generateJsonUrl: function(Workers1, Status, Workers2, bar) {
			 var output = {
				"url": `/${Workers1}`,
				"x_dimsnesion": Status,  // corregido a "x_dimsnesion"
				"y_measure": Workers2,
				"chart_type": bar
			};
			return output;

		},
		formatterType :function(contentType) {
			switch (contentType) {
				case "VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT":
					return "DOC"; 
				case "X-ZIP-COMPRESSED":
					return "ZIP"; 
				case "APPLICATION/VND.MS-EXCEL":
				case 	 "APPLICATION/MSEXCEL":
				case "APPLICATION/X-MSEXCEL":
				case "APPLICATION/X-MS-EXCEL":
				case "APPLICATION/X-EXCEL":
				case "APPLICATION/XLS":
				case "APPLICATION/X-XLS":
				case "APPLICATION/VND.OPENXMLFORMATS-OFFICEDOCUMENT.SPREADSHEETML.SHEET":
				case "VND.OPENXMLFORMATS-OFFICEDOCUMENT.SPREADSHEETML.SHEET":
					return "XLS"; 
				case "PNG":
					return "PNG";
				case "JPG":
					return "JPG";
				case "JPEG":
					return "JPEG";
				case "PDF":
					return "PDF";
				case "TXT":
					return "TXT";
				case "KPI":
					return "KPI";				
			}
		},
		processRequest: function (status, oController, oModel, data, controllerW) {
			return new Promise((resolve, reject) => {
				var that = this;
				if (status === 'UPDATE') {
//					var path = "/News" + "('" + sap.ui.getCore().byId("__input0").getValue() + "')";
					var path = "/News" + "('" + controllerW.getIdNew() + "')";
					oModel.update(path, data, {
						headers: {
							"Content-Type": "application/json",
							'Accept': 'application/json'
						},
						success: function(oData, response) {
							var texto = oController.getResourceBundle().getText("EditSucce");
							sap.m.MessageToast.show(texto);
							oModel.refresh(true);
							
							if (oData.type === "KPI") {
								//var oModel = this.getOwnerComponent().getModel();
								var content = oController.generateJsonUrl(sap.ui.getCore().byId("__input6").getValue(),
									sap.ui.getCore().byId("__input7").getValue(),
									sap.ui.getCore().byId("__input8").getValue(),
									sap.ui.getCore().byId("__xmlview0--Gbox3").getSelectedKey());
									var hasValueKpi = that.CheckValueKPI(content);
									if (hasValueKpi === true) {
										var jsonStringAgain = JSON.stringify(content);
										content.formato = oData.type;
										content.data = jsonStringAgain;
										oController.actualizar_new_content(controllerW, oController, oModel, null, content);
									}
							}if(oData.type === "PDF") {
								var oModelPDF = sap.ui.getCore().getModel("globalAttachModel");
								if (oModelPDF) {
									var data = oModelPDF.getData();
									var content = {};
									content.formato = oData.type;
									content.data = data.staticContentAttach.data
									oController.actualizar_new_content(controllerW,oController,oModel,data.staticContentAttach.nombreFichero,content);
								}else{
									var content = {};
									content.formato = null;
									content.data = null;
									oController.actualizar_new_content(controllerW,oController,oModel,null,content);
								}

								oModel.refresh(true);
							}
							resolve(oData); // Resuelve la promesa si todo es exitoso
						},
						error: function(oError) {
							var texto = oController.getResourceBundle().getText("EditFailed");
							sap.m.MessageToast.show(texto);
							reject(oError); // Rechaza la promesa si hay un error
						}
					});
		
				} else if (status === 'CREATE') {
					var path = "/News";
					oModel.create(path, data, {
						headers: {
							"Content-Type": "application/json",
							'Accept': 'application/json'
						},
						success: function(oData, response) {
							var texto = oController.getResourceBundle().getText("NewSucce");
							sap.m.MessageToast.show(texto);
							oModel.refresh(true);

							if (oData.type === "KPI") {
								var content = oController.generateJsonUrl(sap.ui.getCore().byId("__input6").getValue(),
									sap.ui.getCore().byId("__input7").getValue(),
									sap.ui.getCore().byId("__input8").getValue(),
									sap.ui.getCore().byId("__xmlview0--Gbox3").getSelectedKey());
								var hasValueKpi = that.CheckValueKPI(content);
								if (hasValueKpi === true) {
									var jsonStringAgain = JSON.stringify(content);
									content.formato = oData.type;
									content.data = jsonStringAgain;
									oController.actualizar_new_content(controllerW, oController, oModel, null, content);
								}
							}
							if(oData.type === "PDF") {
								var oModelPDF = sap.ui.getCore().getModel("globalAttachModel");
								if (oModelPDF) {
									var data = oModelPDF.getData();
									var content = {};
									content.formato = oData.type;
									content.data = data.staticContentAttach.data;
									oController.actualizar_new_content(controllerW,oController,oModel,data.staticContentAttach.nombreFichero,content);
								}
								else{
									var content = {};
									content.formato = null;
									content.data = null;
									oController.actualizar_new_content(controllerW,oController,oModel,null,content);
								}
								oModel.refresh(true);
							}
							resolve(oData); // Resuelve la promesa si todo es exitoso
						},
						error: function(oError) {
							var texto = oController.getResourceBundle().getText("NewFailed");
							sap.m.MessageToast.show(texto);
							reject(oError); // Rechaza la promesa si hay un error
						}
					});
				}else {
					reject(new Error('Invalid status provided.'));
				}
			});
		},
		CheckValueKPI:function (obj) {
			return Object.values(obj).some(value => {
				return value && value.trim().length > 0;
			});
		}, 
		checkForUpdate: function(oModel,controllerW) {
			return new Promise(function(resolve, reject) {
				var desiredId = controllerW.getIdNew();
				
				// Suponiendo que guardaste directamente la referencia de la tabla en el modelo del núcleo.
				var oTable = sap.ui.getCore().getModel("worklistTable");
				var aTableItems = oTable.getItems();	
				var status = "CREATE";
				for (var i = 0; i < aTableItems.length; i++) {
					var oItem = aTableItems[i];
					var oBindingContext = oItem.getBindingContext();
					var oRowData = oBindingContext.getObject();
					if (oRowData.id === desiredId) { // Asume que 'id' es la propiedad en tus datos
						status = "UPDATE";
						var oModel = new sap.ui.model.json.JSONModel({ staticVar: "UPDATE" });
						sap.ui.getCore().setModel(oModel, "globalModel");
						break;
					}
				}
				resolve(status);
			});
		}
				
		,
		performOperation: function(oModel,status, data) {
			return new Promise(function(resolve, reject) {
				//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
				var controllerW = this.getMainViewController();
				if (status === "UPDATE") {
//					var path = "/News" + "('" + sap.ui.getCore().byId("__input0").getValue() + "')";
					var path = "/News" + "('" + controllerW.getIdNew() + "')";
					oModel.update(path, data, {
						success: function (oData, response) {
							//console.log("Actualizacion")
						}
					});
				} else if (status === "CREATE") {
					var path = "/News";
					oModel.create(path, data, {
						success: function (oData, response) {
							//console.log("Creacion")
						}
					});
				} else {
					reject(new Error('Invalid status provided.'));
				}
			});
		},
		checkFieldEmply:function(id1, id2){
			switch (id1) {
				case 'INPUT':
					var oInput = sap.ui.getCore().byId(id2);
					var sValue = oInput.getValue();
					break;
				case 'COMBO':
					var oInput = sap.ui.getCore().byId(id2)
					var sValue = oInput.getSelectedKey();
					break;
			}
			if (!sValue) {
				oInput.setValueState("Error");
				oInput.setPlaceholder("Enter a valid value")
				return false;  // Devuelve false si está vacío
			} else {
				oInput.setValueState("None");
				return true;  // Devuelve true si está lleno
			}
		}	,
		addContentItem: function(oModel,data) {
			var aItems = oModel.getProperty("/items");
			aItems.push(data);
			oModel.setProperty("/items", aItems);
		},
		updateContentItem: function(oModel,sId, oNewValues) {
			var aItems = oModel.getProperty("/items");
		
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].id === sId) {
					// Actualizando las propiedades del ítem
					if (oNewValues.file_name !== undefined) {
						aItems[i].file_name = oNewValues.file_name;
					}
					if (oNewValues.content_type !== undefined) {
						aItems[i].content_type = oNewValues.content_type;
					}
					if (oNewValues.textcontent !== undefined) {
						aItems[i].textcontent = oNewValues.textcontent;
					}
					if (oNewValues.doccontent !== undefined) {
						aItems[i].doccontent = oNewValues.doccontent;
					}
		
					// Guardando los cambios en el modelo
					oModel.setProperty("/items", aItems);
					break; // Salir del bucle una vez que se ha actualizado el ítem
				}
			}
		},
		deleteContentItem: function (oModel,sFileName) {
			var aItems = oModel.getProperty("/items");
		
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].file_name === sFileName) {
					aItems.splice(i, 1);
					break;
				}
			}
			oModel.setProperty("/items", aItems);
		},
		getContentItemById: function(oModel,sId) {
			var aItems = oModel.getProperty("/items");
		
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].id === sId) {
					return aItems[i];
				}
			}
			return null; // No se encontró el ítem
		},
		getModelo: function(self, omodel,idModelo){
			return self.getView().getModel(omodel, idModelo); 
		},
		setModelo: function(self,oData,idModelo){
			var oModel = new sap.ui.model.json.JSONModel(oData);
			self.getView().setModel(oModel, idModelo);
		},
		saveBackupContent:function(odata){
			this.oOriginalContent = JSON.parse(JSON.stringify(odata));
		},
		saveBackupHeader:function(odata){
			this.oOriginalHeader = JSON.parse(JSON.stringify(odata));
		},
		resetModelo:function(omodel,backup){
			omodel.setData(JSON.parse(JSON.stringify(backup)));
		},
		getReadContent: function(oModel, hash) {
			return new Promise((resolve, reject) => {
				var path = "/News" + "('" + hash + "')/content";
				oModel.read(path, {
					success: function (oData, response) {
						resolve(oData);  // Usa resolve para devolver el valor
					},
					error: function(oError) {
						resolve(oError);  // Maneja el error
					}   
				});
			});
			},
		getReadHeader: function(oModel, hash) {
				return new Promise((resolve, reject) => {
					var path = "/News" + "('" + hash + "')";
					oModel.read(path, {
						success: function (oData, response) {
							resolve(oData);  // Usa resolve para devolver el valor
						},
						error: function(oError) {
							resolve(oError);  // Maneja el error
						}   
					});
				});
				},
				GetHeaderAndContent: function(oModel, hash) {
					return new Promise((resolve, reject) => {
						// Leer la cabecera primero
						this.getReadHeader(oModel, hash)
							.then((headerData) => {
								// Guardar la cabecera
								this.saveBackupHeader(headerData);
				
								// Ahora leer el contenido
								return this.getReadContent(oModel, hash);  
							})
							.then((contentData) => {
								// Guardar el contenido
								this.saveBackupContent(contentData);
				
								// Retornar ambas tablas
								resolve({
									header: this.oOriginalHeader,
									content: this.oOriginalContent
								});
							})
							.catch((error) => {
								console.log("Error durante la lectura:", error);
								reject(error);  // Si hay un error, rechazamos la promesa principal
							});
					});
				},
				onRevertChanges: function(that,tabla,oCurrentModel) {
					var oController = this;
					//that.onDeleteCascade();
					that.onDeleteCascadeV2();
					if (Array.isArray(tabla.results)) {
						tabla.results.forEach(function(record) {
							var sRecordId = record.id;
							var path = "/News_Content" + "(guid'" + sRecordId + "')";
				
							// Hacer la actualización en el backend
							oCurrentModel.update(path, record, {
								headers: {
									"Content-Type": "application/json",
									'Accept': 'application/json'
								},
								success: function(oData, response) {
									var texto = oController.getResourceBundle().getText("EditSucce");
									sap.m.MessageToast.show(texto);
								},
								error: function(oError) {
									var texto = oController.getResourceBundle().getText("EditFailed");
									sap.m.MessageToast.show(texto);
								}
							});
						});
					}
				},deleteRecordById: function(sId) {
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
				setBackupWithElimination: function(that, tablaCabecera, tablaContenido, oCurrentModel) {
					var oController = this;
					var that = this;
				
					return new Promise(function(resolve, reject) {
						if (!tablaContenido) {
							if (tablaCabecera === 0) {
								//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
								var controllerW = that.getMainViewController();
								that.deleteRecordById(controllerW.getIdNew());
								
							}
							resolve();
							return;  // Esto evitará que el resto del código en esta función se ejecute
						}
				
						//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
						var controllerW = that.getMainViewController();
						var oModel = oController.getOwnerComponent().getModel();
						var path = "/News" + "('" + controllerW.getIdNew() + "')/content";
				
						oModel.read(path, {
							success: function(oData, response) {
								if (oData && oData.results && oData.results.length > 0) {
									var deletionPromises = oData.results.map(function(item) {
										return new Promise(function(resolve, reject) {
											var deleP = "/News_Content" + "(" + item.id + ")";
											oModel.remove(deleP, {
												success: function() {
													var texto = oController.getResourceBundle().getText("DeleteSucce");
													sap.m.MessageToast.show(texto);
													resolve();
												},
												error: function() {
													var texto = oController.getResourceBundle().getText("DeleteFailed");
													sap.m.MessageToast.show(texto);
													reject();
												}
											});
										});
									});
				
									Promise.all(deletionPromises).then(function() {
										if (Array.isArray(tablaContenido.results)) {
											tablaContenido.results.forEach(function(record) {
												var sRecordId = record.id;
												var path = "/News_Content" + "(guid'" + sRecordId + "')";
				
												oCurrentModel.update(path, record, {
													headers: {
														"Content-Type": "application/json",
														'Accept': 'application/json'
													},
													success: function(oData, response) {
														var texto = oController.getResourceBundle().getText("EditSucce");
														sap.m.MessageToast.show(texto);
													},
													error: function(oError) {
														var texto = oController.getResourceBundle().getText("EditFailed");
														sap.m.MessageToast.show(texto);
													}
												});
											});
										}
										resolve();
									}).catch(function() {
										reject();
									}).finally(function() {
										if (tablaCabecera === 0) {
											that.deleteRecordById(controllerW.getIdNew());
										}
									});
								} else {
									if (Array.isArray(tablaContenido.results)) {
										tablaContenido.results.forEach(function(record) {
											var sRecordId = record.id;
											var path = "/News_Content" + "(guid'" + sRecordId + "')";
			
											oCurrentModel.update(path, record, {
												headers: {
													"Content-Type": "application/json",
													'Accept': 'application/json'
												},
												success: function(oData, response) {
													var texto = oController.getResourceBundle().getText("EditSucce");
													sap.m.MessageToast.show(texto);
												},
												error: function(oError) {
													var texto = oController.getResourceBundle().getText("EditFailed");
													sap.m.MessageToast.show(texto);
												}
											});
										});
									}
									resolve();
								}
							},
							error: function(oError) {
								var texto = oController.getResourceBundle().getText("DeleteFailed");
								sap.m.MessageToast.show(texto);
								reject();
							}
						});
					});
				}
				,
				setInitialvari: function(controllerW){
					var data = {};
					data.data = "";
					data.nombreFichero = "";
					data.type = sap.ui.getCore().byId("__xmlview0--Tbox1").getSelectedKey();
					data.operation = "CREATE"
					data.id = controllerW.getIdNew();
					data.new_id = controllerW.getIdContent();
					var oModel = new sap.ui.model.json.JSONModel({ staticContentAttach: data });
					sap.ui.getCore().setModel(oModel, "globalAttachModel");	
				},

				getMainViewController: function() {
					return this.oView.getController();
				}			
			}
	);

});