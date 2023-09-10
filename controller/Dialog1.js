sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(ManagedObject, MessageBox, History) {

	return ManagedObject.extend("configuringnews.controller.Dialog1", {
		constructor: function(oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "configuringnews.view.Dialog1", this);
			this._bInit = false;
			this._oDeferred = null;  
		},

		exit: function() {
			delete this._oView;
		},

		getView: function() {
			return this._oView;
		},
        onCancelPressDialog: function(){

			this._oControl.close();

			// Ejecuta el callback si se ha definido
			if (this._callback) {
				this._callback(false);  // Pasar false indica que el usuario canceló el diálogo
				this._callback = null;  // Limpia el callback para futuras llamadas
			}
			
        },

		getControl: function() {
			return this._oControl;
		},

		getOwnerComponent: function() {
			return this._oView.getController().getOwnerComponent();
		},


		open: function(callback) {
			var oView = this._oView;
			var oControl = this._oControl;
		
			if (!this._bInit) {
				this.onInit();
				this._bInit = true;
				oView.addDependent(oControl);
			}
		
			// Almacena el callback para su uso posterior
			this._callback = callback;
		
			var args = Array.prototype.slice.call(arguments, 1); // Ignora el primer argumento ya que es el callback
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
			this._oDeferred = new Promise((resolve, reject) => {
				this._resolve = resolve;
				this._reject = reject;
			});
			
			return this._oDeferred;  // Esto es importante
		},
		onAcceptPressDialog: function(oEvent) {
			// ... Tu código existente ...
			var selectedValue = this.getSelectedValue();
    
			// Obtener el controlador de la vista principal
			var oMainViewController = this.getMainViewController();
			//Eliminar el contenido en cascada para no crear inconsistencia de tareas
			if (oMainViewController.sCurrentValue === "NOT" ) {
				//oMainViewController.onDeleteCascade("KPI");
				oMainViewController.onDeleteCascadeV2("KPI");
			}else{
				//oMainViewController.onDeleteCascade();
				oMainViewController.onDeleteCascadeV2();
			}
			// Invocar la función en el controlador principal
			var previus = oMainViewController.previousValue;
			if (previus === 'KPI') {
				sap.ui.getCore().byId("__input6").setValue("");
				sap.ui.getCore().byId("__input7").setValue("");
				sap.ui.getCore().byId("__input8").setValue("");
				sap.ui.getCore().byId("__xmlview0--Gbox3").setSelectedKey("");
			}
			oMainViewController.onvalidationEditByControl(sap.ui.getCore().byId("__xmlview0--Tbox1").getSelectedKey());
			oMainViewController.previousValue = oMainViewController.sCurrentValue;

			this._oControl.close();

			var oMainController = this.getMainViewController();
			if (oMainController && typeof oMainController._onValidation_change === 'function') {
				oMainController._onValidation_change(oEvent);
			}

    // Ejecuta el callback si se ha definido
			if (this._callback) {
				this._callback(true);  // Pasar true indica que el usuario aceptó el diálogo
				this._callback = null;  // Limpia el callback para futuras llamadas
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
