import type { EditableKeyframe } from '@/type';
import {
	DEFAULT_FADE_KEYFRAME,
	DEFAULT_LOOP_KEYFRAME,
	DEFAULT_ON_KEYFRAME,
	DEFAULT_PULSE_KEYFRAME,
} from '@/utility/constant';
import { sanitizeKeyframe } from '@dl_sean/ado-light-show-common/src/script';
import { useEffect, useState } from 'react';

const MODES = ['on', 'fade', 'pulse', 'loop'] satisfies EditableKeyframe['mode'][];

interface Props {
	kf: EditableKeyframe;
	disabled: boolean;
	onUpdate: (newKeyframe: EditableKeyframe) => void;
	onDelete: (id: string) => void;
}
const Keyframe = ({ kf, disabled, onUpdate, onDelete }: Props) => {
	const [localKF, setLocalKF] = useState<EditableKeyframe>(kf);
	useEffect(() => {
		setLocalKF(kf);
	}, [kf]);

	return (
		<div>
			<button disabled={disabled} onClick={() => onDelete(localKF.id)}>
				Delete
			</button>

			<div>
				Start Time:
				<input
					type="number"
					disabled={disabled}
					value={localKF.time}
					onBlur={() => {
						onUpdate(localKF);
					}}
					onChange={(e) => {
						setLocalKF((x) => ({
							...sanitizeKeyframe({ ...x, time: Number(e.target.value) }),
							id: x.id,
						}));
					}}
				/>
			</div>
			<div>
				Mode:
				<select
					value={localKF.mode}
					onChange={(e) => {
						const mode = e.target.value as EditableKeyframe['mode'];

						setLocalKF((x) => {
							let newKF: EditableKeyframe | null = null;
							switch (mode) {
								case 'on':
									newKF = { ...DEFAULT_ON_KEYFRAME, id: x.id, time: x.time };
									break;
								case 'fade':
									newKF = { ...DEFAULT_FADE_KEYFRAME, id: x.id, time: x.time };
									break;
								case 'pulse':
									newKF = { ...DEFAULT_PULSE_KEYFRAME, id: x.id, time: x.time };
									break;
								case 'loop':
									newKF = { ...DEFAULT_LOOP_KEYFRAME, id: x.id, time: x.time };
									break;
								default:
									break;
							}
							if (newKF === null) return x;

							onUpdate(newKF);
							return newKF;
						});
					}}
				>
					{MODES.map((mode) => (
						<option key={mode} value={mode}>
							{mode}
						</option>
					))}
				</select>
			</div>
			{localKF.mode === 'on' ? (
				<div>
					<div>
						Color:
						<input
							type="color"
							value={localKF.color}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({ ...localKF, color: e.target.value }),
									id: localKF.id,
								});
							}}
						/>
					</div>
				</div>
			) : localKF.mode === 'fade' ? (
				<div>
					<div>
						Start Color:{' '}
						<input
							type="color"
							value={localKF.colors[0]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										colors: [e.target.value, localKF.colors[1]],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
					<div>
						End Color:{' '}
						<input
							type="color"
							value={localKF.colors[1]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										colors: [localKF.colors[0], e.target.value],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
					<div>
						Offset:{' '}
						<input
							type="number"
							value={localKF.offset}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										offset: Number(e.target.value),
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
				</div>
			) : localKF.mode === 'pulse' ? (
				<div>
					<div>
						Fade in Color:{' '}
						<input
							type="color"
							value={localKF.colors[0]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										colors: [
											e.target.value,
											localKF.colors[1],
											localKF.colors[2],
										],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
					<div>
						Peak Color:{' '}
						<input
							type="color"
							value={localKF.colors[1]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										colors: [
											localKF.colors[0],
											e.target.value,
											localKF.colors[2],
										],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
					<div>
						Fade out Color:{' '}
						<input
							type="color"
							value={localKF.colors[2]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										colors: [
											localKF.colors[0],
											localKF.colors[1],
											e.target.value,
										],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
					<div>
						Fade in offset:{' '}
						<input
							type="number"
							value={localKF.offsets[0]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										offsets: [Number(e.target.value), localKF.offsets[1]],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
					<div>
						Fade out offset:{' '}
						<input
							type="number"
							value={localKF.offsets[1]}
							onBlur={() => {
								onUpdate(localKF);
							}}
							onChange={(e) => {
								setLocalKF({
									...sanitizeKeyframe({
										...localKF,
										offsets: [localKF.offsets[0], Number(e.target.value)],
									}),
									id: localKF.id,
								});
							}}
						/>
					</div>
				</div>
			) : localKF.mode === 'loop' ? (
				<div>
					<button
						onClick={() => {
							const newColors = [...localKF.colors];
							newColors.push(
								localKF.colors.at(-1) ?? DEFAULT_LOOP_KEYFRAME.colors[0],
							);
							const newOffsets = [...localKF.offsets];
							newOffsets.push(
								localKF.offsets.at(-1) ?? DEFAULT_LOOP_KEYFRAME.offsets[0],
							);

							const newKF = {
								...localKF,
								colors: newColors,
								offsets: newOffsets,
								id: localKF.id,
							};
							setLocalKF(newKF);
							onUpdate(newKF);
						}}
					>
						Add segment
					</button>
					<button
						onClick={() => {
							const newColors = [...localKF.colors];
							newColors.pop();
							const newOffsets = [...localKF.offsets];
							newOffsets.pop();

							const newKF = {
								...localKF,
								colors: newColors,
								offsets: newOffsets,
								id: localKF.id,
							};
							setLocalKF(newKF);
							onUpdate(newKF);
						}}
					>
						Delete segment
					</button>
					{localKF.colors.map((color, i) => (
						<div key={`${localKF.id}-color-${i}`}>
							Color {i + 1}:{' '}
							<input
								type="color"
								value={color}
								onBlur={() => {
									onUpdate(localKF);
								}}
								onChange={(e) => {
									const newColors: string[] = [...localKF.colors];
									newColors[i] = e.target.value;

									setLocalKF({
										...sanitizeKeyframe({
											...localKF,
											colors: newColors,
										}),
										id: localKF.id,
									});
								}}
							/>
						</div>
					))}
					{localKF.offsets.map((offset, i) => (
						<div key={`${localKF.id}-offset-${i}`}>
							Offset {i + 1}:{' '}
							<input
								type="number"
								value={offset}
								onBlur={() => {
									onUpdate(localKF);
								}}
								onChange={(e) => {
									const newOffsets: number[] = [...localKF.offsets];
									newOffsets[i] = Number(e.target.value);

									setLocalKF({
										...sanitizeKeyframe({
											...localKF,
											offsets: newOffsets,
										}),
										id: localKF.id,
									});
								}}
							/>
						</div>
					))}
				</div>
			) : (
				<></>
			)}
		</div>
	);
};

export default Keyframe;
