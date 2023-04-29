import { Autocomplete } from 'Elements/Autocomplete';
import useRecentPlayerNames from 'hooks/players/useRecentPlayerNames';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { HighScoreEntity } from 'interfaces';
import { useRef, useState } from 'react';

interface Props {
    index: number;
    singSetupId: string;
    score: HighScoreEntity;
    register: ReturnType<typeof useKeyboardNav>['register'];
    onSave: (singId: string, score: number, oldName: string, newName: string) => void;
}

function HighScoreRename({ score, register, singSetupId, onSave, index }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [newName, setNewName] = useState('');
    const playerNames = useRecentPlayerNames();

    const onBlur = () => {
        if (newName.trim().length && newName.trim() !== score.name)
            onSave(singSetupId, score.score, score.name, newName);
    };

    return (
        <Autocomplete
            className="ph-no-capture"
            options={playerNames}
            onChange={setNewName}
            onBlur={onBlur}
            value={newName}
            label=""
            ref={inputRef}
            {...register(`highscore-rename-${index}`, () => inputRef.current?.focus())}
            placeholder={score.name}
            data-test={`input-edit-highscore`}
            data-original-name={score.name}
        />
    );
}

export default HighScoreRename;
