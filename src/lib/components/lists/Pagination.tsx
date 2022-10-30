import React from 'react';
import styles from './Pagination.module.scss';
import {IconButton} from '../IconButton';
import {useLocationSearch} from '../../utils/locationSearch';
import cn from 'classnames';

interface IPaginationProps {
  page: number;
  countOnPage: number;
  hasNextPage: boolean;
  queryParamPage?: string;
  onChangePage?: (page: number) => void;
}

export const Pagination = (props: IPaginationProps) => {
  const {getLinkWithParam} = useLocationSearch();
  return (
    <div className={cn(styles.root, 'grid-pagination__root')}>
      {props.page > 0 && (
        <IconButton
          iconSetName="navigation"
          iconId="chevronLeft"
          caption=""
          href={
            props.queryParamPage
              ? getLinkWithParam(props.queryParamPage, `${props.page - 1}`)
              : undefined
          }
          onClick={() => {
            if (props.onChangePage) props.onChangePage(props.page - 1);
          }}
        />
      )}
      {props.hasNextPage && (
        <IconButton
          iconSetName="navigation"
          iconId="chevronRight"
          caption=""
          href={
            props.queryParamPage
              ? getLinkWithParam(props.queryParamPage, `${props.page + 1}`)
              : undefined
          }
          onClick={() => {
            if (props.onChangePage) props.onChangePage(props.page + 1);
          }}
        />
      )}
    </div>
  );
};
