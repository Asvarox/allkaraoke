import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { HighScoreEntity, SingSetup, Song } from 'interfaces';
import { Button } from 'modules/Elements/Button';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import { useEditScore } from 'modules/Songs/stats/hooks';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import ScoreText from 'routes/Game/Singing/GameOverlay/Components/ScoreText';
import HighScoreRename from './HighScoreRename';

interface Props {
  onNextStep: () => void;
  singSetup: SingSetup;
  highScores: HighScoreEntity[];
  song: Song;
}

function HighScoresView({ onNextStep, highScores, singSetup, song }: Props) {
  const { register } = useKeyboardNav();
  const editScore = useEditScore(song);

  return (
    <>
      <ScoresContainer data-test="highscores-container">
        {highScores.map((score, index) => (
          <ScoreContainer isCurrentSing={score.singSetupId === singSetup.id} key={index}>
            <ScorePosition>{index + 1}</ScorePosition>

            <ScorePlayerName className="ph-no-capture">
              {score.singSetupId === singSetup.id ? (
                <HighScoreRename
                  index={index}
                  score={score}
                  register={register}
                  singSetupId={singSetup.id}
                  onSave={editScore}
                />
              ) : (
                score.name
              )}
            </ScorePlayerName>
            <ScoreScore>
              <ScoreText score={score.score} />
            </ScoreScore>
            <ScoreDate>{dayjs(score.date).format('MMMM D, YYYY')}</ScoreDate>
          </ScoreContainer>
        ))}
      </ScoresContainer>
      <SongSelectionButton {...register('play-next-song-button', onNextStep, undefined, true)}>
        Select song
      </SongSelectionButton>
    </>
  );
}

const ScoresContainer = styled.div`
  position: absolute;
  top: 20rem;
  width: 100%;
  text-align: center;
  padding: 0 16rem;
  box-sizing: border-box;
`;

const ScoreContainer = styled.div<{ isCurrentSing: boolean }>`
  position: relative;
  ${typography};
  font-size: 3.2rem;
  display: flex;
  background: ${(props) => (props.isCurrentSing ? 'rgba(0,0,0,.9)' : 'rgba(0,0,0,.5)')};
  margin-bottom: 2rem;
  padding: ${(props) => (props.isCurrentSing ? `0 1.5rem` : `1rem 3.2rem`)};
  align-items: center;
`;
const ScorePosition = styled.div`
  padding: 0 1.6rem;
  color: ${styles.colors.text.active};
`;
const ScorePlayerName = styled.div`
  text-align: left;
  flex: 1;
  padding: 1.6rem;
`;
const ScoreScore = styled.div`
  padding: 0 1rem;
`;
const ScoreDate = styled.div`
  position: absolute;
  font-size: 2rem;
  bottom: -1rem;
  right: -1.6rem;
  background: black;
  padding: 0.5rem;
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
  position: absolute;
  bottom: 13rem;
  right: 2rem;
  padding: 0 3rem;
  font-size: 1.9vw;
`;

export default HighScoresView;
