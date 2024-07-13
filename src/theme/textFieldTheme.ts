import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label': {
            color: '#5A698F',
          },
          '& label.Mui-focused': {
            color: '#5A698F',
          },
          '& .MuiInput-underline:before': {
            borderBottomColor: '#5A698F',
          },
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottomColor: '#5A698F',
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: '#5A698F',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#5A698F',
            },
            '&:hover fieldset': {
              borderColor: '#5A698F',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5A698F',
            },
          },
          '& .MuiInputBase-input': {
            color: '#5A698F',
          },
        },
      },
    },
  },
});

export default theme;