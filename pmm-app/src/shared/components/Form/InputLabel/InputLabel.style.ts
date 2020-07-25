import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import { stylesFactory, selectThemeVariant } from '@grafana/ui';

export const getStyles = stylesFactory((theme: GrafanaTheme) => {
  const { colors }: any = theme;
  const backgroundColor = selectThemeVariant(
    { light: colors.gray98, dark: colors.dark3 },
    theme.type,
  );
  const border = selectThemeVariant(
    {
      light: `${theme.border.width.sm} solid ${colors.pageHeaderBorder}`,
      dark: 'none'
    },
    theme.type,
  );

  return {
    inputLabel: css`
      align-items: center;
      background-color: ${backgroundColor};
      border: ${border};
      border-right: 0;
      border-radius: 3px 0 0 3px;
      color: ${theme.colors.text};
      display: flex;
      font-family: ${theme.typography.fontFamily.sansSerif};
      font-size: ${theme.typography.size.md};
      height: 100%;
      min-width: 80px;
      padding: 0 8px 0 12px;
    `,
  };
});
