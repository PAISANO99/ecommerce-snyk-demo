import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import SocialButtons from '../../../src/components/SocialButtons';

describe('SocialButtons accessibility', () => {
  it('renders without critical accessibility violations', async () => {
    const { container } = render(<SocialButtons />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
