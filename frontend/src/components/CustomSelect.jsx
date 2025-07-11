import * as React from 'react';
import PropTypes from 'prop-types';
import { Select as BaseSelect, selectClasses } from '@mui/base/Select';
import { Option as BaseOption, optionClasses } from '@mui/base/Option';
import { styled } from '@mui/system';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import { CssTransition } from '@mui/base/Transitions';
import { PopupContext } from '@mui/base/Unstable_Popup';

export default function CustomSelect({ options, value, onChange }) {
    return (
        <Select value={value} onChange={onChange}>
            {options.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                    {opt.label}
                </Option>
            ))}
        </Select>
    );
}

CustomSelect.propTypes = {
    options: PropTypes.array.isRequired, // [{ value: '', label: '' }]
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

// --- rest of your custom select component code here ---
const Select = React.forwardRef(function CustomSelect(props, ref) {
    const slots = {
        root: StyledButton,
        listbox: AnimatedListbox,
        popup: Popup,
        ...props.slots,
    };

    return <BaseSelect {...props} ref={ref} slots={slots} />;
});

Select.propTypes = {
    slots: PropTypes.shape({
        listbox: PropTypes.elementType,
        popup: PropTypes.elementType,
        root: PropTypes.elementType,
    }),
};

const blue = {
    100: '#DAECFF',
    200: '#99CCF3',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0059B2',
    900: '#003A75',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Button = React.forwardRef(function Button(props, ref) {
    const { ownerState, ...other } = props;
    return (
        <button type="button" {...other} ref={ref}>
            {other.children}
            <UnfoldMoreRoundedIcon />
        </button>
    );
});

Button.propTypes = {
    children: PropTypes.node,
    ownerState: PropTypes.object.isRequired,
};

const StyledButton = styled(Button, { shouldForwardProp: () => true })(
    ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    min-width: 320px;
    padding: 8px 12px;
    border-radius: 8px;
    text-align: left;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    position: relative;
    transition: all 0.2s;

    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }

    &.${selectClasses.focusVisible} {
      outline: 0;
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
    }

    & > svg {
      font-size: 1rem;
      position: absolute;
      height: 100%;
      top: 0;
      right: 10px;
    }
  `,
);

const Listbox = styled('ul')(
    ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    padding: 6px;
    margin: 12px 0;
    min-width: 320px;
    border-radius: 12px;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    box-shadow: 0 2px 4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'};
    
    .closed & {
      opacity: 0;
      transform: scale(0.95, 0.8);
      transition: opacity 200ms ease-in, transform 200ms ease-in;
    }
    
    .open & {
      opacity: 1;
      transform: scale(1, 1);
      transition: opacity 100ms ease-out, transform 100ms cubic-bezier(0.43, 0.29, 0.37, 1.48);
    }

    .placement-top & {
      transform-origin: bottom;
    }

    .placement-bottom & {
      transform-origin: top;
    }
  `,
);

const AnimatedListbox = React.forwardRef(function AnimatedListbox(props, ref) {
    const { ownerState, ...other } = props;
    const popupContext = React.useContext(PopupContext);

    if (popupContext == null) {
        throw new Error('AnimatedListbox must be inside a Popup');
    }

    const verticalPlacement = popupContext.placement.split('-')[0];

    return (
        <CssTransition
            className={`placement-${verticalPlacement}`}
            enterClassName="open"
            exitClassName="closed"
        >
            <Listbox {...other} ref={ref} />
        </CssTransition>
    );
});

AnimatedListbox.propTypes = {
    ownerState: PropTypes.object.isRequired,
};

const Option = styled(BaseOption)(
    ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 8px;
    cursor: default;

    &.${optionClasses.selected} {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }

    &.${optionClasses.highlighted} {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    }

    &:focus-visible {
      outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    }

    &.${optionClasses.disabled} {
      color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }

    &:hover:not(.${optionClasses.disabled}) {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    }
  `,
);

const Popup = styled('div')`
  z-index: 1;
`;