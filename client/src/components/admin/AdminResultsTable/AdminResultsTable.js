import React, { useState } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import green from '@material-ui/core/colors/green';

import ResultWithRecordTag from '../../ResultWithRecordTag/ResultWithRecordTag';
import { times } from '../../../logic/utils';
import { formatAttemptResult } from '../../../logic/attempts';
import { statsToDisplay } from '../../../logic/results-table-utils';

const useStyles = makeStyles(theme => ({
  row: {
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  ranking: {
    paddingRight: 16,
    width: 50,
  },
  advancable: {
    color: theme.palette.getContrastText(green['A400']),
    backgroundColor: green['A400'],
  },
  mainStat: {
    fontWeight: 600,
  },
}));

const AdminResultsTable = React.memo(
  ({ results, format, eventId, competitionId, onResultClick }) => {
    const classes = useStyles();
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(null);

    const sortedResults =
      orderBy === null
        ? results
        : results.slice().sort((result1, result2) => {
            if (orderBy === 'id') {
              const value = result1.person.id - result2.person.id;
              return order === 'asc' ? value : -value;
            }
            if (orderBy === 'name') {
              const value = result1.person.name.localeCompare(
                result2.person.name
              );
              return order === 'asc' ? value : -value;
            }
            throw new Error(`Unrecognized order rule: ${orderBy}`);
          });

    const handleSortClick = property => {
      if (orderBy !== property) {
        setOrderBy(property);
        setOrder('asc');
      } else if (order === 'asc') {
        setOrder('desc');
      } else {
        /* Third click on the same column gets back to the default order. */
        setOrderBy(null);
        setOrder('asc');
      }
    };

    const stats = statsToDisplay(format, eventId);

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right" className={classes.ranking}>
              #
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={orderBy === 'id'}
                direction={order}
                onClick={() => handleSortClick('id')}
              >
                ID
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={order}
                onClick={() => handleSortClick('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            {times(format.solveCount, index => (
              <TableCell key={index} align="right">
                {index + 1}
              </TableCell>
            ))}
            {stats.map(({ name }) => (
              <TableCell key={name} align="right">
                {name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedResults.map(result => (
            <TableRow
              key={result.person.id}
              hover
              className={classes.row}
              onClick={event => onResultClick(result, event)}
            >
              <TableCell
                align="right"
                className={classNames(classes.ranking, {
                  [classes.advancable]: result.advancable,
                })}
              >
                {result.ranking}
              </TableCell>
              <TableCell align="right">{result.person.id}</TableCell>
              <TableCell>{result.person.name}</TableCell>
              {times(format.solveCount, index => (
                <TableCell key={index} align="right">
                  {formatAttemptResult(result.attempts[index] || 0, eventId)}
                </TableCell>
              ))}
              {stats.map(({ name, type, recordType }, index) => (
                <TableCell
                  key={name}
                  align="right"
                  className={classNames({
                    [classes.mainStat]: index === 0,
                  })}
                >
                  <ResultWithRecordTag
                    result={formatAttemptResult(
                      result[type],
                      eventId,
                      type === 'average'
                    )}
                    recordTag={result.recordTags[recordType]}
                    showPb={false}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);

export default AdminResultsTable;
