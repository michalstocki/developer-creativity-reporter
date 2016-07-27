module.exports.getReportFooter = function(period, person) {
	return `;;;;;;
;;;;;;
;;;;;;
;Oświadczenie pracownika o czasie pracy poświęconym na realizowanie obowiązków twórczych.;;;;;
;Oświadczam, że w okresie miesiąca ${period.monthName} realizowanie przeze mnie obowiązków twórczych obejmowało łącznie nie mniej niż ${person.creativityPercent}% mojego ogólnego czasu pracy.;;;;;
;;;;;;
;Przygotował : ${person.fullName};;;;;
;Zatwierdził :;;;;;`
};
