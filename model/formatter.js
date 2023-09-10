sap.ui.define([] , function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		truncateText: function(text) {
			if (!text) {  // Verifica si el texto es null, undefined o una cadena vacía
				return "";  // Retorna una cadena vacía o cualquier valor por defecto que desees
			}
			return text.length > 16 ? text.substring(0, 16) + "..." : text;
		},
		iconFormatter: function(contentType) {
			switch (contentType) {
				case "TXT":
					return "sap-icon://document-text"; // Ícono para texto
				case "PNG":
				case "JPG":
				case "JPEG":
				case "IMG":
					return "sap-icon://attachment-photo"; // Ícono para imagen
				case "PDF":
					return "sap-icon://pdf-attachment"; // Ícono para PDF
				case "DOC":
				case "DOCX":
					return "sap-icon://doc-attachment"; // Ícono para Word
				case "XLS":
				case "XLSX":
					return "sap-icon://excel-attachment"; // Ícono para Excel
				case "ZIP":
				case "X-ZIP-COMPRESSED":
					return "sap-icon://attachment-zip-file"; // Ícono para Zip
				default:
					return "sap-icon://document"; // Ícono por defecto para otros tipos
			}
		},
		tooltipFormatter: function (contentType) {
			switch (contentType) {
				case "TXT":
					return "Texto";
				case "PNG":
				case "JPG":
				case "JPEG":
				case "IMG":
					return "Imagen";
				case "PDF":
					return "Documento PDF";
				case "VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT":
				case "DOC":
				case "DOCX":
					return "Documento Word";
				case "XLS":
				case "XLSX":
					return "Documento Excel";
				case "ZIP":
				case "X-ZIP-COMPRESSED":
					return "Archivo comprimido ZIP";
				default:
					return "Documento";
			}
		}
	};

});