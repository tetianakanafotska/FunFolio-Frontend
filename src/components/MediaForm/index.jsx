import React, { useState, useEffect } from 'react';

import uploadService from '@services/file-upload.service';
import assetsService from '@services/assets.service';
import boardsService from '@services/boards.service';
import usersService from '@services/users.service';

import { WebcamCapture, AudioCapture, EditButtons } from '@components';
import styles from './index.module.sass';
import loadingGif from '@images/loading.gif';

function MediaForm({
	assetType,
	assetId,
	initialContent,
	saveEdit,
	isEditing,
	setIsEditing,
	deleteAsset,
	setAllAssets,
	setOpenPopUp,
	setOpenMediaForm,
	userId,
}) {
	const [newAssetContent, setNewAssetContent] = useState(initialContent || '');
	const [loading, setLoading] = useState(false);
	const [touched, setTouched] = useState(false);
	const [currentBoardId, setCurrentBoardId] = useState('');

	useEffect(() => {
		setNewAssetContent(initialContent || '');
	}, [initialContent]);

	useEffect(() => {
		const fetchCurrentBoard = async () => {
			const currentDate = new Date().toISOString().slice(0, 10);
			if (userId) {
				try {
					const res = await usersService.getCurrentBoard(userId, currentDate);
					if (res.data.length !== 0) {
						setCurrentBoardId(res.data[0]._id);
						console.log('Existing board found. BoardID:', res.data[0]._id);
					} else {
						console.log('No current board found');
						setCurrentBoardId(null);
					}
				} catch (error) {
					console.error('Error fetching current board:', error);
				} finally {
					setLoading(false);
				}
			}
		};
		fetchCurrentBoard();
	}, [userId]);

	const validateContent = (content) => {
		if (!content.trim()) {
			return false;
		} else if (assetType === 'youtubeURL') {
			const youtubeUrlRegex =
				/^(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+$/;
			return youtubeUrlRegex.test(content);
		}
		return true;
	};

	const handleUploadFile = async (file) => {
		try {
			setLoading(true);
			const fileUrl = await uploadService.uploadFile(file);
			setNewAssetContent(fileUrl);
			return fileUrl;
		} catch (error) {
			console.error('Error uploading file:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			handleUploadFile(file);
		}
	};

	const handleSave = () => {
		saveEdit ? saveEdit(newAssetContent) : addNewAsset();
		setIsEditing ? setIsEditing(false) : setOpenMediaForm(false);
	};

	const addNewAsset = async () => {
		console.log('current id', currentBoardId);
		try {
			let boardId = currentBoardId;

			if (!boardId) {
				const boardResp = await boardsService.post({ userId });
				boardId = boardResp.data._id;
				setCurrentBoardId(boardId);
				console.log('New board created, this id:', boardId);
			}

			const newAsset = {
				type: assetType,
				content: newAssetContent,
				userId: userId,
				boardId: boardId,
			};

			const response = await assetsService.post(newAsset);
			const createdAsset = response.data;
			setAllAssets((prevAssets) => [...prevAssets, createdAsset]);
			setNewAssetContent('');
			setOpenPopUp(false);
			setOpenMediaForm(false);
		} catch (error) {
			console.error('Error adding asset:', error);
		}
	};

	const editButtons = () => {
		return (
			<EditButtons
				handleSave={handleSave}
				validateContent={validateContent}
				newAssetContent={newAssetContent}
				isEditing={isEditing}
				setIsEditing={setIsEditing}
				deleteAsset={deleteAsset}
				touched={touched}
				assetType={assetType}
				assetId={assetId}
				setOpenMediaForm={setOpenMediaForm}
			/>
		);
	};

	return (
		<div className={styles.mediaForm}>
			<div className={styles.mediaForm_bgr}>
				<div className={styles.mediaForm_inputs}>
					{assetType === 'text' && (
						<textarea
							placeholder="What's on your mind today?"
							onChange={(e) => {
								setNewAssetContent(e.target.value);
								setTouched(true);
							}}
							value={newAssetContent}
							className={styles.mediaForm_input}
						/>
					)}
					{assetType === 'image' && (
						<input
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className={styles.mediaForm_input}
						/>
					)}
					{assetType === 'youtubeURL' && (
						<input
							type='text'
							onChange={(e) => {
								setNewAssetContent(e.target.value);
								setTouched(true);
							}}
							value={newAssetContent}
							placeholder='Paste Youtube URL here'
							className={styles.mediaForm_input}
						/>
					)}
					{assetType === 'camImage' && (
						<WebcamCapture
							handleUploadFile={handleUploadFile}
							loading={loading}
							setLoading={setLoading}
						/>
					)}
					{assetType === 'audio' && (
						<AudioCapture
							handleUploadFile={handleUploadFile}
							setLoading={setLoading}
						/>
					)}
					{loading ? (
						<img
							src={loadingGif}
							alt='Loading...'
							style={{ width: '30px', height: '30px' }}
						/>
					) : (
						editButtons()
					)}
				</div>
			</div>
		</div>
	);
}

export default MediaForm;
