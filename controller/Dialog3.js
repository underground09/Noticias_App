sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(ManagedObject, MessageBox, History) {

	return ManagedObject.extend("configuringnews.controller.Dialog3", {
		constructor: function(oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "configuringnews.view.Dialog3", this);
			this._bInit = false;
		},

		exit: function() {
			delete this._oView;
		},

		getView: function() {
			return this._oView;
		},
        onAcceptPressDialog: function(){
		// Obtener el controlador de la vista principal
			//var controllerW = sap.ui.getCore().byId("container-configuringnews---app").getController();
			var controllerW = this.getMainViewController();
			var lvArea = sap.ui.getCore().byId("__xmlview0--IArea").getValue("");
			var oModel = sap.ui.getCore().getModel("myGlobalDial");
			var oData = oModel.getData();
			var oMainViewController = this.getMainViewController();
			var oModel = this.getOwnerComponent().getModel();
			switch (oData.operacion) {

				case 'UPDATE':
					oData.text = lvArea;
					oData.formato = oData.data.content_type;
					oData.data = "";
					oMainViewController.actualizar_new_content(controllerW,controllerW,oModel,"",oData);
					sap.ui.getCore().byId("__xmlview0--IArea").setValue("");
					this._oControl.close();
					break;
				
				case 'CREATE':
					var content = {}
					content.doccontent = null;
					content.file_name = null;
					content.formato = "TXT";
					content.text = lvArea,
					oMainViewController.crear_new_content(controllerW,controllerW,oModel,content);
					sap.ui.getCore().byId("__xmlview0--IArea").setValue("");
					this._oControl.close();
					break;
			}
			
        },onCancelPressDialog: function(){
            // Cierra el diálogo
            this._oControl.close();
        },

		getControl: function() {
			return this._oControl;
		},getMainViewController: function() {
			return this._oView.getController();
		},

		getOwnerComponent: function() {
			return this._oView.getController().getOwnerComponent();
		},

		open: function() {
			var oView = this._oView;
			var oControl = this._oControl;

			if (!this._bInit) {

				// Initialize our fragment
				this.onInit();
				this._bInit = true;
				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		close: function() {
			this._oControl.close();
		},

		setRouter: function(oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function() {
			return {};

		},
		handleRadioButtonGroupsSelectedIndex: function() {
			var that = this;
			this.aRadioButtonGroupIds.forEach(function(sRadioButtonGroupId) {
				var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
				var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
				if (oButtonsBinding) {
					var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
					var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
					oButtonsBinding.attachEventOnce("change", function() {
						if (oSelectedIndexBinding) {
							oSelectedIndexBinding.refresh(true);
						} else {
							oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
						}
					});
				}
			});

		},
		convertTextToIndexFormatter: function(sTextValue) {
			var oRadioButtonGroup = this.byId("sap_m_Dialog_0-content-sap_m_RadioButtonGroup-1691411227945");
			var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
			if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
				// look up index in bound context
				var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
				return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function(oButtonContext) {
					return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
				});
			} else {
				// look up index in static items
				return oRadioButtonGroup.getButtons().findIndex(function(oButton) {
					return oButton.getText() === sTextValue;
				});
			}

		},
		_onRadioButtonGroupSelect: function() {

		},
		onInit: function() {

			this._oDialog = this.getControl();

			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "configuringnews.i18n.i18n" 
			});
			this.getView().setModel(i18nModel, "i18n");

		},
		onExit: function() {
			this._oDialog.destroy();

		},

//		*** Funciones internal ***
		setSelectedValue: function(sValue) {
			this._sSelectedValue = sValue;
			// Ahora puedes usar this._sSelectedValue en cualquier lugar dentro de este controlador
		},
		getSelectedValue: function() {
			return this._sSelectedValue;
		},
		getMainViewController: function() {
			return this._oView.getController();
		}

	});
}, /* bExport= */ true);
