import * as React from 'react';
import PropTypes from 'prop-types';
import { Button as BaseButton, buttonClasses } from '@mui/base/Button';
import { styled } from '@mui/system';

const blue = {
    200: '#99CCFF',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0066CC',
};

const grey = {
    200: '#DAE2ED',
    700: '#434D5B',
};

const StyledButton = styled(BaseButton)`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: ${blue[500]};
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  border: 1px solid ${blue[500]};
  box-shadow: 0 2px 1px rgba(45, 45, 60, 0.2), inset 0 1.5px 1px ${blue[400]}, inset 0 -2px 1px ${blue[600]};

  &:hover {
    background-color: ${blue[600]};
  }

  &.${buttonClasses.active} {
    background-color: ${blue[700]};
    box-shadow: none;
    transform: scale(0.99);
  }

  &.${buttonClasses.focusVisible} {
    box-shadow: 0 0 0 4px ${blue[200]};
    outline: none;
  }

  &.${buttonClasses.disabled} {
    background-color: ${grey[200]};
    color: ${grey[700]};
    border: 0;
    cursor: default;
    box-shadow: none;
    transform: scale(1);
  }
`;

const CustomButton = React.forwardRef(function CustomButton({ children, ...props }, ref) {
    return <StyledButton {...props} ref={ref}>{children}</StyledButton>;
});

CustomButton.propTypes = {
    children: PropTypes.node.isRequired,
};

export default CustomButton;