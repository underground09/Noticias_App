sap.ui.define([
    "./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController) {
	"use strict";

	return BaseController.extend("configuringnews.controller.Informative", {

		onInit : function () {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this.getRouter().getRoute("informative").attachPatternMatched(this._ondetailMatched, this);

		},
		_onButtonPress: function() {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("worklist", true);
		},
		_ondetailMatched : function (oEvent) {
			var inputobjectIdContent = oEvent.getParameter("arguments").objectIdContent;
			var inputobjectId = oEvent.getParameter("arguments").objectId;
			var inputobjecttype = oEvent.getParameter("arguments").objecttype;
			var inputobjectarea = oEvent.getParameter("arguments").objectarea;
			var inputobjectstatus = oEvent.getParameter("arguments").objectstatus;
			var inputobjecttitle = oEvent.getParameter("arguments").objecttitle;
			var inputobjectsubtitle = oEvent.getParameter("arguments").objectsubtitle;
			var inputobjectpriority = oEvent.getParameter("arguments").ojectpriority;
			var inputobjectdescription = oEvent.getParameter("arguments").objectdescription;
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({ 
				area : inputobjectarea,
				status: inputobjectstatus,
				title: inputobjecttitle,
				subtitle: inputobjectsubtitle,
				priority: inputobjectpriority,
				descripcion: inputobjectdescription
			}), "header");
			
			
		this.getView().setModel(new sap.ui.model.json.JSONModel({ inputobjectId: inputobjectId }), "view");
// Hacer el conteo para las pestaña y pasandosela al modelo
		var oModel = this.getView().getModel(); // Asegúrate de tener el modelo OData correctamente configurado
		var sPath = "/News('" + inputobjectId + "')/content";

		oModel.read(sPath, {
			success: function(oData) {
				var counts = {
					pdf: 0,
					img: 0,
					chart: 0,
					excel: 0,
					word: 0,
					text: 0
				};
				
				oData.results.forEach(function(item) {
					switch(item.content_type) {
						case 'pdf':
							counts.pdf++;
							break;
						case 'img':
							counts.img++;
							break;
						case 'png':
							counts.img++;
							break;
						case 'cvs':
							counts.excel++;
							break;
						case 'chart':
							counts.chart++;
							break;
						case 'doc':
							counts.word++;
							break;
						case 'txt':
							counts.text++;
							break;
						default:
							// Manejo para tipos de contenido desconocidos
							break;
					}
				});

				// Ahora, "counts" contiene el número de cada tipo de contenido.
				// Puedes asignar counts a un modelo para reflejarlo en tu vista
				this.getView().setModel(new sap.ui.model.json.JSONModel(counts), "counts");
			}.bind(this),
			error: function(oError) {
				// Manejo de errores
			}
		});

// Conteo		
		var oIconTabBar = this.byId("IconTabBarGral"); // Asegúrate de reemplazar "IconTabBarGral" con el ID correcto de tu IconTabBar
		var selectedKey = oIconTabBar.getSelectedKey(); // Esta será la clave del IconTabFilter seleccionado

		var oFilter;
		if (selectedKey === "pdf") {
			oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.EQ, "pdf");
		} else if (selectedKey === "img" ) {
			oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.EQ, "img");
		} else if (selectedKey === "png" ) {
			oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.EQ, "png");
		}

		this.byId("table4").bindAggregation("items", {
			path: sPath,
			sorter: new sap.ui.model.Sorter('position', false),
			filters: oFilter ? [oFilter] : [],
			template: new sap.m.ColumnListItem({
				type: "Navigation",
				press: this.onListItemPressInformative.bind(this),
				cells: [
					new sap.m.Text({ text: "{position}" }),
					new sap.m.Text({ text: "{textcontent}" }),
					new sap.m.Text({ text: "{content_type}" })
				]
			})
		});
		},
		onTabSelect: function(oEvent) {
			var inputobjectId = this.getView().getModel("view").getProperty("/inputobjectId");
			var sPath = "/News('" + inputobjectId + "')/content";
			var oFilter;
			var oIconTabBar = oEvent.getSource();
			var sKey = oIconTabBar.getSelectedKey();
			var table = "";
			if (sKey === "pdf") {
				oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.EQ, "pdf");
				table = "table4";
			} else if (sKey === "img" ) {
				oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.EQ, "img");
				table = "table5";
			}else if ( sKey === "png") {
				oFilter = new sap.ui.model.Filter("content_type", sap.ui.model.FilterOperator.EQ, "png");
				table = "table5";
			}
			this.byId(table).bindAggregation("items", {
				path: sPath,
				sorter: new sap.ui.model.Sorter('position', false),
				filters: oFilter ? [oFilter] : [],
				template: new sap.m.ColumnListItem({
					type: "Navigation",
					press: this.onListItemPressInformative.bind(this),
					cells: [
						new sap.m.Text({ text: "{position}" }),
						new sap.m.Text({ text: "{textcontent}" }),
						new sap.m.Text({ text: "{content_type}" })
					]
				})
			});
		  },
		onListItemPressInformative:function(oEvent){
			var oItem = oEvent.getSource();
			var oBindingContext = oItem.getBindingContext();
			var sContentType = oBindingContext.getProperty('content_type');
			
			if (sContentType === 'pdf' || sContentType === 'img'|| sContentType === 'png') {
				this.openPopupWithContent(oBindingContext);
    		}
		},
		openPopupWithContent: function (oBindingContext) {
			var sContent = oBindingContext.getProperty('doccontent');
			var sContentType = oBindingContext.getProperty('content_type');
			
			if (sContentType === 'pdf') {
				var byteCharacters = atob(sContent);
				var byteNumbers = new Array(byteCharacters.length);
				for (var i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}
				var byteArray = new Uint8Array(byteNumbers);
				var blob = new Blob([byteArray], {type: 'application/pdf'});
				var blobUrl = URL.createObjectURL(blob);
		
				// Abre el PDF en una nueva ventana o pestaña
				window.open(blobUrl, '_blank');
			} else if (sContentType === 'img' || sContentType === 'png') {
				var imageDataUrl = "data:image/png;base64," + sContent;
				var oPopup = new sap.m.LightBox({
					imageContent : new sap.m.LightBoxItem({
						imageSrc : imageDataUrl
					})
				});
				if (oPopup) {
					oPopup.open();
				}
			}
		},
	});

});