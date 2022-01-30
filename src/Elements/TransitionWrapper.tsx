import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

interface Props {
    show: boolean;
    children: React.ReactNode;
}

export default function TransitionWrapper({ show, children }: Props) {
    return (
        <CSSTransition<HTMLDivElement> in={show} timeout={1000} classNames="fade" unmountOnExit>
            {() => <Box>{children}</Box>}
        </CSSTransition>
    );
}

const Box = styled.div`
    transition: opacity 1000ms;

    // enter from
    &.fade-enter {
        opacity: 0;
    }

    // enter to
    &.fade-enter-active {
        opacity: 1;
    }

    // exit from
    &.fade-exit {
        opacity: 1;
    }

    // exit to
    &.fade-exit-active {
        opacity: 0;
    }
`;
