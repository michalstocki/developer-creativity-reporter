module.exports.getReportHeader = function(period, person) {
	return `;;;;;;
;Karta Ewidencji Utworów;;;;;
;;;;;;
;Imię i Nazwisko;miesiąc;rok;departament;Stanowisko;% pracy twórczej
;${person.fullName};${period.monthName};${period.year};Departament Wytwarzania Oprogramowania;${person.position};${person.creativityPercent}
;;;;;;`
};
