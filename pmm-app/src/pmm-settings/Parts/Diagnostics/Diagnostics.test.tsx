import React from 'react';
import renderer from 'react-test-renderer';
import Diagnostics from './Diagnostics';

describe('Diagnostics part test', () => {
  it('Renders correct', () => {
    const component = renderer.create(<Diagnostics />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
