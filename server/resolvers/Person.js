const { countryByIso2 } = require('../logic/countries');
const { flatMap } = require('../logic/utils');
const { advancingResults } = require('../logic/advancement');
const { withWcif } = require('./utils');

module.exports = {
  _id: ({ registrantId, wcif }) => {
    return `${wcif.id}:${registrantId}`;
  },
  id: ({ registrantId }) => {
    return registrantId;
  },
  country: ({ countryIso2 }) => {
    return countryByIso2(countryIso2);
  },
  results: ({ registrantId, wcif }) => {
    const rounds = flatMap(wcif.events, event => event.rounds);
    const roundsWhereHasResult = rounds.filter(round =>
      round.results.some(
        ({ personId, attempts }) =>
          personId === registrantId && attempts.length > 0
      )
    );
    return roundsWhereHasResult
      .map(round => {
        const advancing = advancingResults(round, wcif);
        const result = round.results.find(
          ({ personId }) => personId === registrantId
        );
        return {
          ...result,
          round,
          advancable: advancing.includes(result),
        };
      })
      .map(withWcif(wcif));
  },
};
