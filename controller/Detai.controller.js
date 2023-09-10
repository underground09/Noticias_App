sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "./Dialog1",
	"./Dialog2",
	"./Dialog3",
    "../model/formatter",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (BaseController, JSONModel, Dialog1, Dialog2,Dialog3, formatter, MessageBox, History) {
	"use strict";
	//variable para ser cargada cuando el usuario suba un archivo valido, este metodo _onFileUploaderTypeMissmatch controla la ejecucion

	return BaseController.extend("configuringnews.controller.Detai", {
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page shows busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			
			var oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
			var error = null;
			this.dataVa = {
				type: null,
				formato: null
			};
			this.dataPDF = {
				typeNew: null,
				typeNewContent: null,
				FileNameNewContent: null
			};
			var LvTypeData = { //Inicializacion para el detaview
				notes: false,
				kpi: false,
				}
			var oModel = new JSONModel(LvTypeData);
			this.getView().setModel(oModel, "myModelType");
			
			this.getRouter().getRoute("detai").attachPatternMatched(this._ondetailMatched, this);
			this.setModel(oViewModel, "detaView");

			//Definicion para limpiar la cache y usar la vista dinamica, con otra ruta, que solo se pase el ID, porque es para crear nueva noticia
			//le estoy pasando los dos parametros 
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("detaNew").attachPatternMatched(this._onObjectMatched, this);
			
			//Variable para creacion de popup dinamicos
			this.popupConstructors = {
				"Dialog1": Dialog1,
				"Dialog2": Dialog2,
				"Dialog3": Dialog3,
			};
			var tablaHeaderBackup = 0;
			var tablaContentsBackup = null;
			var tablaHeaderCurrent = null;
		},_onObjectMatched: function (oEvent) {
			var LvTypeData = {
				notes: false,
				kpi: false,
				}
			var oModel = new JSONModel(LvTypeData);
			this.getView().setModel(oModel, "myModelType");
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var oPage = this.byId("page");
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			oPage.setTitle(oResourceBundle.getText("NewAddTitle"));

			//var oModel = new sap.ui.model.json.JSONModel({ staticVar: "CREATE" });
			var oModel = new sap.ui.model.json.JSONModel({ staticVar: "UPDATE" });
			sap.ui.getCore().setModel(oModel, "globalModel");
			var inputobjectId = oEvent.getParameter("arguments").objectId;
			var inputobjectIdContent = oEvent.getParameter("arguments").objectIdContent;
			controllerW.setIdNew(inputobjectId);
			sap.ui.getCore().byId("__input1").setValue("");
			sap.ui.getCore().byId("__input2").setValue("");
			sap.ui.getCore().byId("__input3").setValue("");
			sap.ui.getCore().byId("__input4").setValue("");
			controllerW.setIdContent(inputobjectIdContent);
			sap.ui.getCore().byId("__input6").setValue("");
			sap.ui.getCore().byId("__input7").setValue("");
			sap.ui.getCore().byId("__input8").setValue("");
			sap.ui.getCore().byId("__xmlview0--Pbox0").setSelectedKey("");
			sap.ui.getCore().byId("__xmlview0--Tbox1").setSelectedKey("");
			sap.ui.getCore().byId("__xmlview0--Sbox2").setSelectedKey("");
			sap.ui.getCore().byId("__xmlview0--Gbox3").setSelectedKey("");
			sap.ui.getCore().byId("__xmlview0--fileUploader").setValue("");
			sap.ui.getCore().byId("__input1").setEnabled(true);
			sap.ui.getCore().byId("__input2").setEnabled(true);
			sap.ui.getCore().byId("__input3").setEnabled(true);
			sap.ui.getCore().byId("__input4").setEnabled(true);
			sap.ui.getCore().byId("__input6").setEnabled(false);
			sap.ui.getCore().byId("__input7").setEnabled(false);
			sap.ui.getCore().byId("__input8").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Pbox0").setEnabled(true);
			sap.ui.getCore().byId("__xmlview0--Tbox1").setEnabled(true);
			sap.ui.getCore().byId("__xmlview0--Sbox2").setEnabled(true);
			sap.ui.getCore().byId("__xmlview0--Btype").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Gbox3").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--fileUploader").setEnabled(false);
			this.byId("Botones").setVisible(false); 
			this.byId("table3").setVisible(false); 
			controllerW.setInitialvari(controllerW);
//Creamos el estado inicial para refrescar los posibles valores 			
			var data = this.getHeader();
			var oModel = this.getOwnerComponent().getModel();
			var path = "/News";
					oModel.create(path, data, {
						headers: {
							"Content-Type": "application/json",
							'Accept': 'application/json'
						}
					});
			oModel.refresh(true); 
			this.GetTableContent(inputobjectId);
			this.tablaHeaderBackup = 0;
			this.tablaContentsBackup = null;
		},GetTableContent:function(idNew){
				var oModel = new JSONModel({
					selectedId: idNew
				});
				this.getView().setModel(oModel, "myModel");	
				var sPath = "/News('" + this.getView().getModel("myModel").getProperty("/selectedId") + "')/content";
				var oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.NE, "KPI");
				this.byId("table3").bindAggregation("items", {
					path: sPath,
					sorter: new sap.ui.model.Sorter('position', false),
					filters: [oFilter], 
					template: new sap.m.ColumnListItem({
						press: this.onListItemPressDeta.bind(this),
						cells: [
							new sap.ui.core.Icon({
								src: {
									parts: ["content_type"],
									formatter: formatter.iconFormatter
								},
								tooltip: {
									parts: ['content_type'],
									formatter: formatter.tooltipFormatter
								}
							}),
							new sap.m.Text({
								text: {
									parts: ['file_name', 'textcontent'],
									formatter: function(file_name, textcontent) {
										var result = file_name && file_name.trim() !== "" ? file_name : textcontent;
										result = formatter.truncateText(result);
										this.addStyleClass(file_name && file_name.trim() !== "" ? 'blue' : 'green');
										return result;
									}
								}
							}),
							new sap.m.Text({
								text: "{content_type}",
								wrapping: false
							}).bindProperty("text", "content_type", function(sValue) {
								if (sValue == "TXT") {
									this.addStyleClass('green');
								} else {
									this.addStyleClass('blue');
								}
								return sValue;
							})
						]
					})
				});	
				
		},		
		_onFileUploaderChange: function(oEvent) {
			var nombreFichero = sap.ui.getCore().byId("__xmlview0--fileUploader").getValue();
			var buttonAll = oEvent.getSource().getId();
			var button = buttonAll.split("--")[1];
			var aFiles = oEvent.getParameter("files");
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			//var lvIdNew = controllerW.getIdNew();
			var oController = this;
			var oModel = this.getOwnerComponent().getModel();
			var data = {};
			//var error = Boolean
			//Pregunto si he pulsado los botones
			var that = this;
			switch (button) {
				case "CREATE":
					var content = sap.ui.getCore().getModel("globalAttachModel").getProperty("/staticContentAttach");
					data.typeFile = nombreFichero.split(".").pop();
					data.type = content.formato;
					content.nombreFichero = nombreFichero;
					this.crear_new_content(controllerW,oController,oModel,content);
					break;
				case "DELETE":
					this.eliminar_new_content(controllerW,oController,oModel);
					break;
				break;
					default:
				break;
				}
			if (aFiles && aFiles.length > 0) {
				var file = aFiles[0];	
				//Validacion si el usuario sigue su proceso normal
				that.dataVa.type = file.type;
				this.error =this.validacionTool(2,that.dataVa);	
				if (this.error) {
					return;
				}
				var reader = new FileReader();
		
				// Evento de carga del archivo
				reader.onload = function(e) {
					var sBase64Data = e.target.result;
					// Aquí tienes el valor base64 del archivo seleccionado
					// Puedes utilizar sBase64Data para mostrar la imagen en un control Image o enviarla al servidor
					// Suponiendo que tienes un VBox en tu vista con el ID "myVBox" donde quieres mostrar la imagen:
					var data = {};
					var parts = sBase64Data.split(",");
					
					if (parts.length === 2) {
						var header = parts[0].split(";");
		
						if (header.length === 2) {
							data.formato = this.getFormatFromHeader(header[0]);
							data.base = header[1].split("=")[0];
		
							//Formato del archivo sin el prefijo "image/" o "application/"
							//console.log(data.formato); // Ejemplo: "pdf", "png", "jpeg"
							//console.log(data.data); // 
							var lv_sorported = Boolean;
							switch (data.formato) {
								case "pdf":
									lv_sorported = true;
									break;
								case "png":
									lv_sorported = true;
									break;
								case "jpeg":
									lv_sorported = true;
									break;
								case "vnd.openxmlformats-officedocument.wordprocessingml.document":
									lv_sorported = true;
								 	break;
								case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
									lv_sorported = true;
								 	break;
								case "zip":
								case "x-zip-compressed":
									lv_sorported = true;
									break;
								default:
									lv_sorported = false;
									break;
							}
							if (lv_sorported == false) {
								sap.ui.getCore().byId("__xmlview0--fileUploader").setValue("");
								sap.m.MessageBox.confirm("Content not supported", {
									title: "Warning",
									actions: ["Ok"],
									onClose: function(sActionClicked) {
										sActionClicked === "Ok";

									}
								});
								//console.log("No soportado");
							}else{
								data.data = parts[1];
								data.nombreFichero = nombreFichero;
								data.type = sap.ui.getCore().byId("__xmlview0--Tbox1").getSelectedKey();
								data.operation = button; //para guardar
								data.id = controllerW.getIdNew();
								data.new_id = controllerW.getIdContent();
								var oModel = new sap.ui.model.json.JSONModel({ staticContentAttach: data });
								sap.ui.getCore().setModel(oModel, "globalAttachModel");	

							}
						}
					}
				}.bind(this); // Importante: Usar "bind(this)" para asegurarte de que el "this" dentro de la función sea el mismo que en el controlador

				// Leer el archivo como base64
				reader.readAsDataURL(file);
			} else {
				// Manejar el caso cuando no se selecciona ningún archivo o cuando aFiles es undefined
			}
		},
		_onFileUploaderTypeMissmatch:function(header) {
			sap.ui.getCore().byId("__xmlview0--fileUploader").setValue("");
			sap.m.MessageBox.confirm("Content not supported", {
				title: "Warning",
				actions: ["Ok"],
				onClose: function(sActionClicked) {
					
				}
			});
		},onComboBoxSelectionChange: function(oEvent){
			var oModelType = this.getView().getModel("myModelType");
			
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var oModel = this.getOwnerComponent().getModel();
			var oComboBox = oEvent.getSource();
			this.sCurrentValue = oComboBox.getSelectedKey();

//Validacion para el typeMime de forma dinamica, en caso de cambio
			if (this.sCurrentValue === "PDF") {
				this._allowOnlyPDF = true;
				oModelType.setProperty("/notes", true);
				oModelType.setProperty("/kpi", false);
			}
			if(this.sCurrentValue === "NOT"){
				this._allowOnlyPDF = false;
				oModelType.setProperty("/notes", true);
				oModelType.setProperty("/kpi", false);
			}
			if(this.sCurrentValue === "KPI"){
			oModelType.setProperty("/kpi", true);
			oModelType.setProperty("/notes", false);
			}
			this.onvalidationEditByControl(this.sCurrentValue);
			
		},onComboBoxSelectionType: function(oEvent){
				this.callPopup("Dialog2");
		},callPopup:function(Popup){
				var sDialogName = Popup;
				this.mDialogs = this.mDialogs || {};

				var oDialog = this.mDialogs[sDialogName];
				if (!oDialog) {
					var DialogConstructor = this.popupConstructors[Popup];
					if (!DialogConstructor) {
						throw new Error("No se encontró el constructor para el popup: " + Popup);
					}
					oDialog = new DialogConstructor(this.getView());
					this.mDialogs[sDialogName] = oDialog;
					oDialog.setRouter(this.oRouter);
				}
				oDialog.open();
		},
		callPopup1: function(Popup, callback) {
			var sDialogName = Popup;
			this.mDialogs = this.mDialogs || {};
		
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				var DialogConstructor = this.popupConstructors[Popup];
				if (!DialogConstructor) {
					throw new Error("No se encontró el constructor para el popup: " + Popup);
				}
				oDialog = new DialogConstructor(this.getView());
				this.mDialogs[sDialogName] = oDialog;
				oDialog.setRouter(this.oRouter);
			}
		
			oDialog._callback = callback;  // Guarda el callback en el diálogo
			oDialog.open();
		},call_Popup1: function(Popup) {
		
			this.callPopup1(Popup, function(userAccepted) {
				if (userAccepted) {
					// Aquí manejas lo que sucede si el usuario aceptó el diálogo
					controllerW.content_has_son(oModel, controllerW.getIdNew())
						.then(function(count) {
							if (count !== 0) {
								return true;
							}
						}.bind(this))
						.catch(function(error) {
							// Manejar el error
						});
				} else {
					// Aquí manejas lo que sucede si el usuario canceló el diálogo
				}
			}.bind(this));
		},
				
		
		// Función para obtener la extensión del formato desde el encabezado
		getFormatFromHeader: function(header) {
			var parts = header.split("/");
			if (parts.length === 2) {
				return parts[1]; // Devuelve la última parte, que es la extensión del formato
			}
			return "";
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function(save) {
			/*var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
			this.getRouter().navTo("worklist",true);*/
			var oTable = this.byId("table3");
			oTable.unbindAggregation("items");
			this.previousValue = "";
			this.sCurrentValue = "";
			this.getOwnerComponent().getRouter().navTo("worklist")
			//var ltTablaContenido = this.tablaContentsBackup;
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the detail path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'detail'
		 * @private
		 */
		_ondetailMatched : function (oEvent) {
			//Creo una backup del modelo inicial
			var modelLocal = this.getOwnerComponent().getModel();
			this.getView().setModel(modelLocal, "localModel");

			var oPage = this.byId("page");
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			oPage.setTitle(oResourceBundle.getText("NewEditTitle"));

			var inputobjectIdContent = oEvent.getParameter("arguments").objectIdContent;
			var inputobjectId = oEvent.getParameter("arguments").objectId;
			var inputobjecttype = oEvent.getParameter("arguments").objecttype;
			var inputobjectarea = oEvent.getParameter("arguments").objectarea;
			var inputobjectstatus = oEvent.getParameter("arguments").objectstatus;
			var inputobjecttitle = oEvent.getParameter("arguments").objecttitle;
			var inputobjectsubtitle = oEvent.getParameter("arguments").objectsubtitle;
			var inputobjectpriority = oEvent.getParameter("arguments").ojectpriority;
			var inputobjectdescription = oEvent.getParameter("arguments").objectdescription;
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			
			controllerW.setIdNew(inputobjectId);
			//sap.ui.getCore().byId("__input0").setValue(inputobjectId);
			sap.ui.getCore().byId("__input1").setValue(inputobjectarea);
			sap.ui.getCore().byId("__input2").setValue(inputobjecttitle);
			sap.ui.getCore().byId("__input3").setValue(inputobjectsubtitle);
			sap.ui.getCore().byId("__input4").setValue(inputobjectdescription);
			controllerW.setIdContent(inputobjectIdContent);
			//sap.ui.getCore().byId("__input5").setValue(inputobjectIdContent);
			sap.ui.getCore().byId("__input6").setValue("");
			sap.ui.getCore().byId("__input7").setValue("");
			sap.ui.getCore().byId("__input8").setValue("");
			sap.ui.getCore().byId("__xmlview0--Pbox0").setSelectedKey(inputobjectpriority);
			sap.ui.getCore().byId("__xmlview0--Tbox1").setSelectedKey(inputobjecttype);
			sap.ui.getCore().byId("__xmlview0--Sbox2").setSelectedKey(inputobjectstatus);
			sap.ui.getCore().byId("__xmlview0--Gbox3").setSelectedKey("");
			sap.ui.getCore().byId("__xmlview0--fileUploader").setValue("");

			//sap.ui.getCore().byId("__input0").setEnabled(false);
			sap.ui.getCore().byId("__input1").setEnabled(false);
			sap.ui.getCore().byId("__input2").setEnabled(false);
			sap.ui.getCore().byId("__input3").setEnabled(false);
			sap.ui.getCore().byId("__input4").setEnabled(false);
			//sap.ui.getCore().byId("__input5").setEnabled(false);
			sap.ui.getCore().byId("__input6").setEnabled(false);
			sap.ui.getCore().byId("__input7").setEnabled(false);
			sap.ui.getCore().byId("__input8").setEnabled(false);

			sap.ui.getCore().byId("__xmlview0--Btype").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Pbox0").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Tbox1").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Sbox2").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Gbox3").setEnabled(false);
			sap.ui.getCore().byId("__area0").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--fileUploader").setEnabled(false);
			//Caso de inicial de la ruta principal
			var oModelType = this.getView().getModel("myModelType");
			if (inputobjecttype === "PDF") {
				this._allowOnlyPDF = true;
				this.getPDF(controllerW);
				oModelType.setProperty("/notes", true);
				oModelType.setProperty("/kpi", false);
			}if(inputobjecttype === "NOT"){
				this._allowOnlyPDF = false;
				oModelType.setProperty("/notes", true);
				oModelType.setProperty("/kpi", false);
			}
			if(inputobjecttype === "KPI"){
				this.getKPI(controllerW);
				oModelType.setProperty("/kpi", true);
				oModelType.setProperty("/notes", false);
			}
			this.byId("Botones").setVisible(false); 
			this.byId("table3").setVisible(false); 
			this.previousValue = inputobjecttype // Inicializamos el valor previo

//	Paso el valor pulsado para ver si tengo que llamar al update o al create, debido a que el boton guardar es comun para ambos
			var oModel = new sap.ui.model.json.JSONModel({ staticVar: "UPDATE" });
			sap.ui.getCore().setModel(oModel, "globalModel");
// 	Pasandole el id a la vista
		var oModel = new JSONModel({
			selectedId: inputobjectId
		});
		this.getView().setModel(oModel, "myModel");	

		controllerW.GetHeaderAndContent(modelLocal, inputobjectId).then((result) => {
			this.tablaHeaderBackup = result.header;
			this.tablaContentsBackup = result.content;
		})
		.catch((error) => {
			console.log("Error al obtener las tablas:", error);
		});

		// Define la ruta después de que se haya establecido el modelo
		//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
		var controllerW = this.getMainViewController();
		this.GetTableContent(inputobjectId);
		this.tablaHeaderBackup = 1;
		
		},onUpdateFinishedTable3: function(oEvent) {
			// Obtiene el total de registros
			var iTotalItems = oEvent.getParameter("total");
			
			// Actualiza el título
			this.byId("table3").getHeaderToolbar().getContent()[0].setText("Items (" + iTotalItems + ")");
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
		_onButtonPress: function() {
				this.previousValue = "";
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("worklist");
				var oCurrentModel = this.getView().getModel("localModel");
				var oTable = this.byId("table3");
				oTable.unbindAggregation("items");
				this.previousValue = "";
				this.sCurrentValue = "";
				//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
				var controllerW = this.getMainViewController();
				var ltTablaHeader = this.tablaHeaderBackup;
				var ltTablaContenido = this.tablaContentsBackup;
				controllerW.setBackupWithElimination(this,ltTablaHeader,ltTablaContenido,oCurrentModel);
			//}

		},getQueryParameters: function(oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},_onValidation_change: function(oEvent){
			var oModel = this.getOwnerComponent().getModel();
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			this.error = this.validacionTool(1);
			if (this.error) {
				return;
			}
// Verifica si tiene cambio de tipo de noticia 
			this.error = this.validacionTool(4,null,oModel);
			if (this.error) {
				return;
			}
//Validacion del KPI 			
			if (this.sCurrentValue === "KPI") {
				this.error = this.validacionTool(5);
				if (this.error) {
					return;
				}
			}
			var staticVar = sap.ui.getCore().getModel("globalModel").getProperty("/staticVar");
			var data = this.getHeader();
			var oController = this;
			controllerW.processRequest(staticVar, oController, oModel, data, controllerW)
			.then((response) => {
				//console.log("Exitosa la operacion"+staticVar);
			})
			.catch((error) => {
				//console.log("Fallida la operacion"+staticVar);
			});
			this.onNavBack();
		},
		getHeader:function(){
			var oUser = ""
			//var oUser = sap.ushell.Container.getService("UserInfo").getId();
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var data = {
				id: controllerW.getIdNew(),
				type: sap.ui.getCore().byId("__xmlview0--Tbox1").getSelectedKey(),
				area: sap.ui.getCore().byId("__input1").getValue(),
				priority: sap.ui.getCore().byId("__xmlview0--Pbox0").getSelectedKey(),
				status: sap.ui.getCore().byId("__xmlview0--Sbox2").getSelectedKey(),
				title: sap.ui.getCore().byId("__input2").getValue(),
				subtitle: sap.ui.getCore().byId("__input3").getValue(),
				description: sap.ui.getCore().byId("__input4").getValue(),
			};
			return data;
		},
		setHeader:function(data){
			this.sSelectedHeader = data;
		},
		_onValidation_edit:function(oEvent){
			//Validacion por tipo, para edicion de campos
			var type = sap.ui.getCore().byId("__xmlview0--Tbox1").getSelectedKey();
			this.onvalidationEditByControl(type);

		},onFieldsNotes:function(oModelType){
			oModelType.setProperty("/notes", true);
			oModelType.setProperty("/kpi", false);
			sap.ui.getCore().byId("__input1").setEnabled(true);
			sap.ui.getCore().byId("__input2").setEnabled(true);
			sap.ui.getCore().byId("__input3").setEnabled(true);
			sap.ui.getCore().byId("__input4").setEnabled(true);
			sap.ui.getCore().byId("__input6").setEnabled(false);
			sap.ui.getCore().byId("__input7").setEnabled(false);
			sap.ui.getCore().byId("__input8").setEnabled(false);
			sap.ui.getCore().byId("__xmlview0--Pbox0").setEnabled(true);
			sap.ui.getCore().byId("__xmlview0--Tbox1").setEnabled(true);
			sap.ui.getCore().byId("__xmlview0--Sbox2").setEnabled(true);
			sap.ui.getCore().byId("__xmlview0--Gbox3").setEnabled(false);
			sap.ui.getCore().byId("__area0").setEnabled(false);
			this.byId("Botones").setVisible(true);
		},
		onvalidationEditByControl: function(type){
			var oModelType = this.getView().getModel("myModelType");
			switch (type) {
				case 'NOT':
					this.onFieldsNotes(oModelType);
					sap.ui.getCore().byId("__xmlview0--fileUploader").setEnabled(false);
					sap.ui.getCore().byId("__xmlview0--Btype").setEnabled(true); //Valor text/content
					this.byId("CREATE").setVisible(true);
					this.byId("table3").setVisible(true); // Accede a la tabla por su ID
					break;
				case 'PDF':
					//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
					var controllerW = this.getMainViewController();
					var oModel = this.getOwnerComponent().getModel();
					this.onFieldsNotes(oModelType);
					sap.ui.getCore().byId("__xmlview0--fileUploader").setEnabled(true);
					sap.ui.getCore().byId("__xmlview0--Btype").setEnabled(false); //Valor text/content
					this.byId("CREATE").setVisible(false);	
					this.byId("table3").setVisible(false); // Accede a la tabla por su ID				
					break;
				case 'KPI':
					oModelType.setProperty("/kpi", true);
					oModelType.setProperty("/notes", false);
					sap.ui.getCore().byId("__input1").setEnabled(true);
					sap.ui.getCore().byId("__input2").setEnabled(true);
					sap.ui.getCore().byId("__input3").setEnabled(true);
					sap.ui.getCore().byId("__input4").setEnabled(true);
					sap.ui.getCore().byId("__input6").setEnabled(true);
					sap.ui.getCore().byId("__input7").setEnabled(true);
					sap.ui.getCore().byId("__input8").setEnabled(true);
					sap.ui.getCore().byId("__xmlview0--Pbox0").setEnabled(true);
					sap.ui.getCore().byId("__xmlview0--Tbox1").setEnabled(true);
					sap.ui.getCore().byId("__xmlview0--Sbox2").setEnabled(true);
					sap.ui.getCore().byId("__xmlview0--Gbox3").setEnabled(true);
					sap.ui.getCore().byId("__area0").setEnabled(false);
					sap.ui.getCore().byId("__xmlview0--fileUploader").setEnabled(false);
					sap.ui.getCore().byId("__xmlview0--Btype").setEnabled(false);
					var oHBox = this.byId("Botones"); 
					oHBox.setVisible(false);
					var oTable = this.byId("table3"); // Accede a la tabla por su ID
    				oTable.setVisible(false);
					break;
			}
		},onValidation_delete:function(oEvent){
			//sap.m.MessageToast.show("Va a eliminar")
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			//Eliminacion
				var oController = this;
				var oModel = this.getOwnerComponent().getModel();
//					var path = "/News"+"('"+sap.ui.getCore().byId("__input0").getValue()+"')"
					var path = "/News"+"('"+controllerW.getIdNew()+"')"
					oModel.remove(path, {
							success: function (oData, response) {
								//Se deberia actualizar
								var texto = oController.getResourceBundle().getText("DeleteSucce");
								sap.m.MessageToast.show(texto);
								//oModel.refresh(true); //.
							},
							error: function (oError) {
									var texto = oController.getResourceBundle().getText("DeleteFailed");
									sap.m.MessageToast.show(texto)
							}
						}
					);
					this.onNavBack();
		}, onListItemPressDeta: function(oEvent){
			 var oListItem = oEvent.getParameter("listItem");
			 // obtén el contexto de los datos ligados al ListItem
			 var oBindingContext = oListItem.getBindingContext();
			 // obtén la entidad del ListItem (esto contendrá todos los datos del objeto seleccionado)
			 var oEntity = oBindingContext.getObject();
			 // obtén el ID del objeto seleccionado. Suponiendo que tu entidad tiene un atributo llamado 'id'
			 var sObjectId = oEntity.id;
			 var sObjectName = oEntity.file_name;
			 //var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			 var controllerW = this.getMainViewController();
			controllerW.setIdContent(sObjectId);
			sap.ui.getCore().byId("__xmlview0--fileUploader").setValue(sObjectName); //Nombre de archivo


		},_onFileUploaderChangeFile: function(oEvent) {
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var mimeType = "";
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			var path = "/News_Content"+"(guid'"+controllerW.getIdContent()+"')"
			//			var path = "/News_Content"+"(guid'"+sap.ui.getCore().byId("__input5").getValue()+"')"
					oModel.read(path, {
							success: function (oData, response) {
								//Se deberia actualizar
								var base64Data = oData.doccontent
								if (oData.content_type == "PNG") {
									mimeType = "image/png";
								}
								if (oData.content_type == "JPG" || oData.content_type == "JPEG") {
									mimeType = "image/jpg";
								}
								if (oData.content_type == "PDF") {
									mimeType = "application/pdf";
								}
								if (oData.content_type == "ZIP") {
									mimeType = "application/zip";
								}
								if (oData.content_type == "TXT") {
									that.callPopup("Dialog3");
									sap.ui.getCore().byId("__xmlview0--IArea").setValue(oData.textcontent);
									var oTestModel = new sap.ui.model.json.JSONModel({ operacion : "UPDATE", data: oData });
									sap.ui.getCore().setModel(oTestModel, "myGlobalDial");
									return;
								}
							
								var byteCharacters = atob(base64Data);
								var byteNumbers = new Array(byteCharacters.length);
								for (var i = 0; i < byteCharacters.length; i++) {
									byteNumbers[i] = byteCharacters.charCodeAt(i);
								}
								var byteArray = new Uint8Array(byteNumbers);
								var blob = new Blob([byteArray], {type: mimeType});
								var blobUrl = URL.createObjectURL(blob);
							
								if (mimeType === "application/pdf") {
									// Si es un pdf, puedes abrirlo en un nuevo window/tab
									window.open(blobUrl, '_blank');
								} else if (mimeType.startsWith("image/")) {
									// Si es una imagen, puedes mostrarla en un sap.m.Dialog
									var html = new sap.ui.core.HTML({
										content: "<img src='" + blobUrl + "' width='auto' height='auto'>",
										preferDOM : false
									});
							
									var dialog = new sap.m.Dialog({
										title: 'Image Preview',
										contentWidth: "auto",
										contentHeight: "auto",
										content: [html],
										beginButton: new sap.m.Button({
											text: 'Close',
											press: function () {
												dialog.close();
											}
										}),
										afterClose: function() {
											dialog.destroy();
										}
									});
							
									dialog.open();
								}
							},
							error: function (oError) {
								sap.m.MessageToast.show("Pulse un valor de la tabla para ver el contenido")
							}
						}
					);
			
		
		},_onFileUploaderChangeDownload: function(){
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var mimeType = "";
			var oModel = this.getOwnerComponent().getModel();
			var path = "/News_Content"+"(guid'"+controllerW.getIdContent()+"')"
			//			var path = "/News_Content"+"(guid'"+sap.ui.getCore().byId("__input5").getValue()+"')"
					oModel.read(path, {
							success: function (oData, response) {
								//Se deberia actualizar
								var base64Data = oData.doccontent
								if (oData.content_type == "png") {
									mimeType = "image/png";
								}
								if (oData.content_type == "jpg") {
									mimeType = "image/jpg";
								}
								if (oData.content_type == "pdf") {
									mimeType = "application/pdf";
								}
							
								var fileName = oData.file_name; 
								//var fileName = oData.textcontent; 
								var byteCharacters = atob(base64Data);
								var byteNumbers = new Array(byteCharacters.length);
								for (var i = 0; i < byteCharacters.length; i++) {
									byteNumbers[i] = byteCharacters.charCodeAt(i);
								}
								var byteArray = new Uint8Array(byteNumbers);
							
								var blob = new Blob([byteArray], {type: mimeType});
								var blobUrl = URL.createObjectURL(blob);
							
								var link = document.createElement("a");
								link.href = blobUrl;
								link.download = fileName;
								link.click();
								URL.revokeObjectURL(blobUrl); // Libera la memoria ocupada por el blob
							},
							error: function (oError) {
								sap.m.MessageToast.show("Pulse un valor de la tabla para ver el contenido")
							}
						}
					);		
		},crear_new_content:function(controllerW,oController,oModel,content){
			var that = this;
			controllerW.setIdContent(controllerW.onGetHashGuion());
				var position;
				controllerW.content_has_son(oModel, controllerW.getIdNew(),0)
				.then(function(count) {
					if (count == null) {
						position = "0";
					}else{
						position = count;
					}
					var lvContentType = content.formato;
					if (lvContentType) {
						lvContentType = controllerW.formatterType(lvContentType.toUpperCase());
					}
				//  Espero la promesa a ser evaluada para seguir
				var data = {
					id: controllerW.getIdContent(),
					new_id: controllerW.getIdNew(),
					file_name: content.nombreFichero,
					position: position,
					content_type: lvContentType,
					textcontent: content.text,
					doccontent: content.data,
				};
					var path = "/News_Content"
					oModel.create(path, data, {
							headers: {
								"Content-Type": "application/json",
								'Accept': 'application/json'
							},
							success: function (oData, response) {
								//Se deberia actualizar
								var texto = oController.getResourceBundle().getText("NewSucce");
								sap.m.MessageToast.show(texto);
								//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
								//var controllerW = this.getMainViewController();
								var controllerW = that.getMainViewController();
								var sObjectIdContent = controllerW.onGetHashGuion()
								controllerW.setIdContent(sObjectIdContent);
								sap.ui.getCore().byId("__input6").setValue("");
								sap.ui.getCore().byId("__xmlview0--fileUploader").setValue("");
								oModel.refresh(true); //.
							},
							error: function (oError) {
									var texto = oController.getResourceBundle().getText("NewFailed");
									sap.m.MessageToast.show(texto)
							}
						}
					);
				}.bind(this))
				.catch(function(error) {
					// Maneja el error aquí si es necesario
				});
		},actualizar_new_content: function(controllerW, oController, oModel, nombreFichero, content) {
			var oUser = ""
			controllerW.content_has_son(oModel, controllerW.getIdNew())
				.then(function(count) {
					var position;
					if (count == null) {
						position = "0";
					} else {
						position = count;
					}
					var lvContentType = content.formato;
					if (lvContentType) {
						lvContentType = controllerW.formatterType(lvContentType.toUpperCase());
					}
					var data = {
						id: controllerW.getIdContent(),
						new_id: controllerW.getIdNew(),
						file_name: nombreFichero,
						position: position,
						content_type: lvContentType,
						textcontent: content.text,
						doccontent: content.data,
					};
					var path = "/News_Content" + "(guid'" + controllerW.getIdContent() + "')"					
					oModel.update(path, data, {
						headers: {
							"Content-Type": "application/json",
							'Accept': 'application/json'
						},
						success: function(oData, response) {
							var texto = oController.getResourceBundle().getText("EditSucce");
							sap.m.MessageToast.show(texto);
							oModel.refresh(true);
						},
						error: function(oError) {
							var texto = oController.getResourceBundle().getText("EditFailed");
							sap.m.MessageToast.show(texto);
						}
					});
				});
		}
		,eliminar_new_content:function(controllerW,oController,oModel){
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var that = this;
			var controllerW = this.getMainViewController();
			var path = "/News_Content"+"(guid'"+controllerW.getIdContent()+"')"
						oModel.remove(path, {
								headers: {
									"Content-Type": "application/json",
									'Accept': 'application/json'
								},
								success: function (oData, response) {
									var texto = oController.getResourceBundle().getText("DeleteSucce");
									sap.m.MessageToast.show(texto);
									//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
									//var controllerW = this.getMainViewController();
									var controllerW = that.getMainViewController();
									var sObjectIdContent = controllerW.onGetHashGuion()
									controllerW.setIdContent(sObjectIdContent);
									sap.ui.getCore().byId("__input6").setValue("");
									sap.ui.getCore().byId("__xmlview0--fileUploader").setValue("");
								},
								error: function (oError) {
										var texto = oController.getResourceBundle().getText("DeleteFailed");
										sap.m.MessageToast.show(texto)
								}
							}
						);
		},/*onDeleteCascade: function(filter) {
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var oController = this;
			var oModel = this.getOwnerComponent().getModel();
			var path = "/News" + "('" + controllerW.getIdNew() + "')/content";
		
			oModel.read(path, {
				success: function(oData, response) {
					if (oData && oData.results && oData.results.length > 0) {
		
						var itemsToDelete = oData.results;
		
						// Si se pasa el parámetro filter, filtrar los resultados
						if (filter) {
							itemsToDelete = itemsToDelete.filter(function(item) {
								return item.content_type === filter;
							});
						}
		
						itemsToDelete.forEach(function(item) {
							var deleP = "/News_Content" + "(" + item.id + ")";
							oModel.remove(deleP, {
								success: function() {
									var texto = oController.getResourceBundle().getText("DeleteSucce");
									sap.m.MessageToast.show(texto);
								},
								error: function() {
									var texto = oController.getResourceBundle().getText("DeleteFailed");
									sap.m.MessageToast.show(texto);
								}
							});
						});
					}
				},
				error: function(oError) {
					var texto = oController.getResourceBundle().getText("DeleteFailed");
					sap.m.MessageToast.show(texto);
				}
			});
		},*/
		onDeleteCascadeV2: function(filter) {
			var controllerW = this.getMainViewController();
			var oController = this;
			var oModel = this.getOwnerComponent().getModel();
		
			// Antes leías los contenidos y luego los borrabas uno por uno.
			// Ahora, si entiendo correctamente, simplemente quieres llamar a la función deleteContents para borrarlos.
			var sFunctionName = "/deleteContents";
			var oParameters = {
				method: "GET",
				urlParameters: {
					new_id: controllerW.getIdNew()
				},
				success: function(oData, response) {
					var texto = oController.getResourceBundle().getText("DeleteSucce");
					sap.m.MessageToast.show(texto);
				},
				error: function(oError) {
					var texto = oController.getResourceBundle().getText("DeleteFailed");
					sap.m.MessageToast.show(texto);
				}
			};
		
			// No necesitas filtrar aquí porque la función del backend debería manejar eso.
			// Sin embargo, si aún deseas filtrar antes de llamar a la función, tendrías que mantener el código anterior 
			// que filtra los resultados y sólo llamar a deleteContents si el filtro devuelve resultados.
			
			oModel.callFunction(sFunctionName, oParameters);
		}
		
		,getKPI:function(controllerW){
			var oController = this;
				var oModel = this.getOwnerComponent().getModel();
//					var path = "/News"+"('"+sap.ui.getCore().byId("__input0").getValue()+"')/content"
					var path = "/News"+"('"+controllerW.getIdNew() +"')/content"
					oModel.read(path, {
							success: function (oData, response) {
								if (oData && oData.results ) {
									if (oData.results.length === 0) {
										return ;
									}
									//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
									//var controllerW = this.getMainViewController();
									var controllerW = oController.getMainViewController();
									var con = oData.results[0].doccontent;
									var obj = JSON.parse(con);
									var parts = obj.url.split('/');
									var workerValue = parts[1];
									controllerW.setIdContent((oData.results[0].id));
									//sap.ui.getCore().byId("__input5").setValue(oData.results[0].id);
									sap.ui.getCore().byId("__input6").setValue(workerValue);
									sap.ui.getCore().byId("__input7").setValue(obj.x_dimsnesion);
									sap.ui.getCore().byId("__input8").setValue(obj.y_measure);
									sap.ui.getCore().byId("__xmlview0--Gbox3").setSelectedKey(obj.chart_type);
									oModel.refresh(true); //.
								}
							},
							error: function (oError) {
									var texto = oController.getResourceBundle().getText("DeleteFailed");
									sap.m.MessageToast.show(texto)
							}
						}
					);
		//			this.onNavBack();
		},getPDF:function(controllerW){
			var oController = this;
				var oModel = this.getOwnerComponent().getModel();
					var path = "/News"+"('"+controllerW.getIdNew() +"')/content"
					oModel.read(path, {
							success: function (oData, response) {
								if (oData && oData.results ) {
									if (oData.results.length === 0) {
										return ;
									}
									//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
									//var controllerW = this.getMainViewController();
									var controllerW = oController.getMainViewController();
									var con = oData.results[0].doccontent;
									var fileName = oData.results[0].file_name;
									controllerW.setIdContent((oData.results[0].id));
									sap.ui.getCore().byId("__xmlview0--fileUploader").setValue(fileName);
									oModel.refresh(true); 
								}
							},
							error: function (oError) {
									var texto = oController.getResourceBundle().getText("DeleteFailed");
									sap.m.MessageToast.show(texto)
							}
						}
					);
		//			this.onNavBack();
		},
				
		/**
		 * Binds the view to the detail path.
		 * @function
		 * @param {string} sdetailPath path to the detail to be bound
		 * @private
		 */
		_bindView : function (sdetailPath) {
			var oViewModel = this.getModel("detailView");

			this.getView().bindElement({
				path: sdetailPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_getI18nText: function(sKey) {
			return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
		},
		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getModel("detailView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle();

			oView.getBindingContext().requestdetail().then((function (odetail) {
				var sdetailId = odetail.code,
					sdetailName = odetail.description;

				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmaildetailSubject", [sdetailId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmaildetailMessage", [sdetailName, sdetailId, location.href]));
			}).bind(this));
		},
		refreshTableWithNewId: function(nuevoId) {
			var oModel = new JSONModel({
				selectedId: nuevoId
			});
			this.getView().setModel(oModel, "myModel");
			var self = this;
			// 1. Actualizar el modelo con el nuevo ID
			oModel.setProperty("/selectedId", nuevoId);
		
			// 2. Definir el nuevo path basado en el nuevo ID
			var sPath = "/News('" + nuevoId + "')/content";
		
			// 3. Definir el filtro (este parece ser constante en tu código, así que lo reutilizamos)
			var oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.NE, "KPI");
		
			// 4. Reasociar la tabla con el nuevo path y configuración
			this.byId("table3").bindAggregation("items", {
				path: sPath,
				sorter: new sap.ui.model.Sorter('position', false),
				filters: [oFilter], 
				template: new sap.m.ColumnListItem({
					press: this.onListItemPressDeta.bind(this),
					cells: [
						new sap.ui.core.Icon({
							src: {
								parts: ["content_type"],
								formatter: this.formatter.iconFormatter
							},
							tooltip: {
								parts: ['content_type'],
								formatter: this.formatter.tooltipFormatter
							}
						}),
						new sap.m.Text({
							text: {
								parts: ['file_name', 'textcontent'],
								formatter: function(file_name, textcontent) {
									var result = file_name && file_name.trim() !== "" ? file_name : textcontent;
									result = self.formatter.truncateText(result);
									this.addStyleClass(file_name && file_name.trim() !== "" ? 'blue' : 'green');
									return result;
								}
							}
						}),
						new sap.m.Text({
							text: "{content_type}",
							wrapping: false
						}).bindProperty("text", "content_type", function(sValue) {
							if (sValue == "TXT") {
								this.addStyleClass('green');
							} else {
								this.addStyleClass('blue');
							}
							return sValue;
						})
					]
				})
			});
		
		},validacionTool:function(id,data,oModel){
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			switch (id) {
				case 1:
//Validacion para chequear campos vacios cabecera					
					var allFieldsFilled = true;  // Asumimos inicialmente que todos los campos están llenos
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("INPUT","__input1");
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("INPUT","__input2");
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("COMBO","__xmlview0--Pbox0");
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("COMBO","__xmlview0--Tbox1");
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("COMBO","__xmlview0--Sbox2");
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("INPUT","__input3");
					allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("INPUT","__input4");
					
					if (allFieldsFilled) {
						return false;
					} else {
						return true;
					}
//Comprobar que el tipo PDF sea tipo de archivo .PDF, porque los mimetype estan general				
				case 2:
					if (sap.ui.getCore().byId("__xmlview0--Tbox1").getSelectedKey() === 'PDF') {
						if (data.type !== "undefined") {
							if (data.type !== "application/pdf") {
								this._onFileUploaderTypeMissmatch();

								var globalAttachModel = sap.ui.getCore().getModel("globalAttachModel");
								var content;

								if (globalAttachModel && typeof globalAttachModel.getProperty === 'function') {
									content = globalAttachModel.getProperty("/staticContentAttach");
								} else {
									console.error("El modelo 'globalAttachModel' no está definido o no tiene el método 'getProperty'.");
								}

								if (content) {
									content.formato = "";
									content.data = "";
									content.file_name = "";
									content.nombreFichero = "";
									sap.ui.getCore().getModel("globalAttachModel").setProperty("/staticContentAttach",content);
								} else {
									console.error("El objeto 'content' no está definido o es nulo.");
								}

								return true;
							}
						}else if (data.formato !== 'PDF' || data.formato !== 'pdf' ){
							this._onFileUploaderTypeMissmatch();
							var content = sap.ui.getCore().getModel("globalAttachModel").getProperty("/staticContentAttach");
								if (content) {
									content.formato = "";
									content.data = "";
									content.file_name = "";
									content.nombreFichero = "";
									sap.ui.getCore().getModel("globalAttachModel").setProperty("/staticContentAttach",content);
								}
								return true;
						}
					}
					break;
//Verificar que la data no esta actualizada, deberia guardar primero antes				
				case 3:
				// Desarrollar..
//Notificar, si cambia kpi <> notas/pdf, borrara para evitar inconsistencia					
				case 4:
					if (this.previousValue) {
						if ((this.previousValue === "NOT" || this.previousValue === "PDF") && this.sCurrentValue === "KPI") {
							// Cambió de "Notes" o "PDF" a "KPI"
							this.call_Popup1("Dialog1");	
							return true;					
						} 
						else if ((this.sCurrentValue === "NOT" || this.sCurrentValue === "PDF") && this.previousValue === "KPI") {
								// Cambió de "KPI" a "Notes" o "PDF"
								this.call_Popup1("Dialog1");
								return true;
						}
						else if (this.sCurrentValue === "PDF" && this.previousValue === "NOT") {
							// Cambió de "Notes" a "PDF"
							// evaluar evaluo del contenido
							var archivo = sap.ui.getCore().byId("__xmlview0--fileUploader").getValue();
							if (typeof archivo !== "undefined" && archivo) {
								var parts = archivo.split('.'); // divide el string usando el punto como delimitador
							
								if (parts.length > 1) {
									var fileExtension = parts[parts.length - 1].split(' ')[0]; // toma la última parte, que será la extensión
									//console.log("La extensión del archivo es:", fileExtension);
							
									var formatMatch = archivo.match(/<([^>]+)>/); // busca el formato entre <>
									if (formatMatch && formatMatch[1].toUpperCase() === "PDF") {
										//console.log("El formato especificado es PDF");
									} else {
										//console.log("El formato especificado no es PDF o no está presente");
										this.dataVa.formato = fileExtension;
										this.error =this.validacionTool(2,this.dataVa);	
										this.call_Popup1("Dialog1");
										return true;
									}
								} else {
									//console.log("No se encontró una extensión de archivo válida");
									this.dataVa.formato = formatMatch;
									this.error =this.validacionTool(2,this.dataVa);	
									return this.error;
								}
							} else {
								//console.log("La variable está indefinida o vacía");
								return false;
							}
							this.call_Popup1("Dialog1");
							return true;
						}
						else{
							return false;
						}
					}
					break;
				case 5:
					//Validar si KPI, campo grafic type
						var allFieldsFilled = true;  // Asumimos inicialmente que todos los campos están llenos
						allFieldsFilled = allFieldsFilled && controllerW.checkFieldEmply("COMBO","__xmlview0--Gbox3");

						if (allFieldsFilled) {
							return false;
						} else {
							return true;
						}
					
				default:
					break;
			}
			
		},getMainViewController: function() {
			return this.oView.getController();
		}
		
	});

});