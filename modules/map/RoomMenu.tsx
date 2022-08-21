import {ExpandLess, ExpandMore, Info, RocketLaunch} from "@mui/icons-material";
import {Collapse, IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import Link from "next/link";
import {useRouter} from "next/router";
import {FC, memo, useEffect, useRef, useState} from "react";
import {AreaData, ChapterData, CheckpointDataExtended, OnRoomSelectFn, RoomData, SideData} from ".";
import {useCampContext} from "../provide/CampContext";
import {teleport} from "../teleport/teleport";

interface MapRoomMenuProps {
  area: AreaData;
  chapter: ChapterData;
  side: SideData;
  checkpoints: CheckpointDataExtended[];
  selectedRoom: string;
  onRoomSelect: OnRoomSelectFn
}

export const MapRoomMenu: FC<MapRoomMenuProps> = memo(({area, chapter, side, checkpoints, selectedRoom, onRoomSelect}) => {
  const teleportParams = `?area=${area.gameId}/${chapter.gameId}&side=${side.id}`;
  const router = useRouter();

  const handleViewChange = (): void => {
    const {areaId, chapterId, sideId} = router.query
    router.replace({query: {areaId, chapterId, sideId}}, undefined, {shallow: true});
  }

  return (
    <>
      <List dense disablePadding sx={{width: "100%", whiteSpace: "nowrap"}}>
        <ListItem
          disablePadding
          secondaryAction={(
            <Link passHref href={`/${area.id}/${chapter.id}?side=${side.id}`}>
              <IconButton component="a" size="small" color="primary">
                <Info fontSize="small"/>
              </IconButton>
            </Link>
          )}
        >
          <ListItemButton onClick={handleViewChange} sx={{overflow: "hidden", textOverflow: "ellipsis"}}>
            <ListItemText>{chapter.name} - {side.name} side</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
      <List dense disablePadding>
        {checkpoints.map((checkpoint, index) => (
          <CheckpointItem
            key={index}
            checkpoint={checkpoint}
            onRoomSelect={onRoomSelect}
            selectedRoom={selectedRoom}
            teleportParams={teleportParams}
          />
        ))}
      </List>
    </>
  );
});

interface CheckpointItemProps {
  checkpoint: CheckpointDataExtended;
  selectedRoom: string;
  onRoomSelect: OnRoomSelectFn;
  teleportParams: string;
}

export const CheckpointItem: FC<CheckpointItemProps> = ({checkpoint, onRoomSelect, selectedRoom, teleportParams}) => {
  const [open, setOpen] = useState<boolean>(true);
  const router = useRouter();

  const handleViewChange = (): void => {
    setOpen(prev => !prev);
    const {areaId, chapterId, sideId} = router.query;
    router.replace({query: {areaId, chapterId, sideId, checkpoint: checkpoint.id}}, undefined, {shallow: true});
  }

  return (
    <>
      <ListItemButton
        key={checkpoint.name}
        onClick={handleViewChange}
        sx={{whiteSpace: "nowrap"}}
      >
        <ListItemText>{checkpoint.name}</ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} unmountOnExit>
        <List dense disablePadding>
          {checkpoint.rooms.map(room => (
            <RoomItem
              key={room.id}
              room={room}
              selectedRoom={selectedRoom}
              onRoomSelect={onRoomSelect}
              teleportParams={teleportParams}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}

interface RoomItemProps {
  room: RoomData;
  selectedRoom: string;
  onRoomSelect: OnRoomSelectFn;
  teleportParams: string
}

export const RoomItem: FC<RoomItemProps> = ({room, onRoomSelect, selectedRoom, teleportParams}) => {
  const router = useRouter();

  const {settings: {port}} = useCampContext();
  const ref = useRef<HTMLLIElement | null>(null);
  const selected: boolean = selectedRoom === room.id;

  const handleClick = (): void => {
    router.replace({query: {room: room.id, areaId: "celeste", chapterId: "city", sideId: "a"}}, undefined, {shallow: true});
    onRoomSelect(room);
  };

  const handleTeleport = (): void => {
    teleport(port, `${teleportParams}&level=${room.id}&x=${room.defaultSpawn.x}&y=${room.defaultSpawn.y}`)
  };

  /**
   * Scroll into view on selection.
   */
  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({block: "nearest", behavior: "smooth"})
    }
  }, [selected]);

  return (
    <ListItem
      ref={ref}
      disablePadding
      secondaryAction={(
        <Tooltip title="Launch" enterDelay={750} placement="right">
          <IconButton size="small" onClick={handleTeleport} color="primary">
            <RocketLaunch fontSize="small"/>
          </IconButton>
        </Tooltip>
      )}
    >
      <ListItemButton
        selected={selectedRoom === room.id}
        key={room.id}
        onClick={handleClick}
        sx={{pl: 4, whiteSpace: "nowrap"}}
      >
        <ListItemText><strong>{room.id}</strong>{room.name && <span> - {room.name}</span>}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
}