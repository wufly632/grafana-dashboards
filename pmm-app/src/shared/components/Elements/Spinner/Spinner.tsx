import React from 'react';
import { Spin } from 'antd';
import { css, cx } from 'emotion';

const spinnerStyle = css`
  color: rgb(211, 211, 211);
  font-size: 36px;
`;

Spin.setDefaultIndicator(
  <i className={cx('fa fa-spinner fa-spin', spinnerStyle)} data-qa="loading-spinner" />
);
