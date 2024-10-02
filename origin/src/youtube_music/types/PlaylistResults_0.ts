export interface PlaylistResults_0 {
    responseContext: ResponseContext
    contents: Contents
    trackingParams: string
    background: Background2
}

export interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[]
}

export interface ServiceTrackingParam {
    service: string
    params: Param[]
}

export interface Param {
    key: string
    value: string
}

export interface Contents {
    twoColumnBrowseResultsRenderer: TwoColumnBrowseResultsRenderer
}

export interface TwoColumnBrowseResultsRenderer {
    secondaryContents: SecondaryContents
    tabs: Tab[]
}

export interface SecondaryContents {
    sectionListRenderer: SectionListRenderer
}

export interface SectionListRenderer {
    contents: Content[]
    continuations: Continuation2[]
    trackingParams: string
}

export interface Content {
    musicShelfRenderer: MusicPlaylistShelfRenderer
    musicPlaylistShelfRenderer: MusicPlaylistShelfRenderer
}

export interface MusicPlaylistShelfRenderer {
    playlistId: string
    contents: Content2[]
    collapsedItemCount: number
    trackingParams: string
    continuations: Continuation[]
    contentsMultiSelectable: boolean
}

export interface Content2 {
    musicResponsiveListItemRenderer: YouTubeMusicPlaylistTrack
}

export interface YouTubeMusicPlaylistTrack {
    trackingParams: string
    thumbnail: Thumbnail
    overlay: Overlay
    flexColumns: FlexColumn[]
    fixedColumns: FixedColumn[]
    menu?: Menu
    badges: Badge[]
    playlistItemData: PlaylistItemData
    multiSelectCheckbox?: MultiSelectCheckbox
    musicItemRendererDisplayPolicy?: string
}

export interface Thumbnail {
    musicThumbnailRenderer: MusicThumbnailRenderer
}

export interface MusicThumbnailRenderer {
    thumbnail: Thumbnail2
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail2 {
    thumbnails: Thumbnail3[]
}

export interface Thumbnail3 {
    url: string
    width: number
    height: number
}

export interface Overlay {
    musicItemThumbnailOverlayRenderer: MusicItemThumbnailOverlayRenderer
}

export interface MusicItemThumbnailOverlayRenderer {
    background: Background
    content: Content3
    contentPosition: string
    displayStyle: string
}

export interface Background {
    verticalGradient: VerticalGradient
}

export interface VerticalGradient {
    gradientLayerColors: string[]
}

export interface Content3 {
    musicPlayButtonRenderer: MusicPlayButtonRenderer
}

export interface MusicPlayButtonRenderer {
    playNavigationEndpoint?: PlayNavigationEndpoint
    trackingParams: string
    playIcon: PlayIcon
    pauseIcon: PauseIcon
    iconColor: number
    backgroundColor: number
    activeBackgroundColor: number
    loadingIndicatorColor: number
    playingIcon: PlayingIcon
    iconLoadingColor: number
    activeScaleFactor: number
    buttonSize: string
    rippleTarget: string
    accessibilityPlayData?: AccessibilityPlayData
    accessibilityPauseData?: AccessibilityPauseData
}

export interface PlayNavigationEndpoint {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint
}

export interface WatchEndpoint {
    videoId: string
    playlistId: string
    playerParams: string
    playlistSetVideoId: string
    loggingContext: LoggingContext
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs
}

export interface LoggingContext {
    vssLoggingContext: VssLoggingContext
}

export interface VssLoggingContext {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs {
    watchEndpointMusicConfig: WatchEndpointMusicConfig
}

export interface WatchEndpointMusicConfig {
    musicVideoType: string
}

export interface PlayIcon {
    iconType: string
}

export interface PauseIcon {
    iconType: string
}

export interface PlayingIcon {
    iconType: string
}

export interface AccessibilityPlayData {
    accessibilityData: AccessibilityData
}

export interface AccessibilityData {
    label: string
}

export interface AccessibilityPauseData {
    accessibilityData: AccessibilityData2
}

export interface AccessibilityData2 {
    label: string
}

export interface FlexColumn {
    musicResponsiveListItemFlexColumnRenderer: MusicResponsiveListItemFlexColumnRenderer
}

export interface MusicResponsiveListItemFlexColumnRenderer {
    text: Text
    displayPriority: string
}

export interface Text {
    runs: Run[]
}

export interface Run {
    text: string
    navigationEndpoint?: NavigationEndpoint
}

export interface NavigationEndpoint {
    clickTrackingParams: string
    browseEndpoint?: BrowseEndpoint
    watchEndpoint?: WatchEndpoint2
}

export interface BrowseEndpoint {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs
}

export interface BrowseEndpointContextSupportedConfigs {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig
}

export interface BrowseEndpointContextMusicConfig {
    pageType: string
}

export interface WatchEndpoint2 {
    videoId: string
    playlistId: string
    playerParams: string
    loggingContext: LoggingContext2
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs2
}

export interface LoggingContext2 {
    vssLoggingContext: VssLoggingContext2
}

export interface VssLoggingContext2 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs2 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig2
}

export interface WatchEndpointMusicConfig2 {
    musicVideoType: string
}

export interface FixedColumn {
    musicResponsiveListItemFixedColumnRenderer: MusicResponsiveListItemFixedColumnRenderer
}

export interface MusicResponsiveListItemFixedColumnRenderer {
    text: Text2
    displayPriority: string
    size: string
}

export interface Text2 {
    runs: Run2[]
}

export interface Run2 {
    text: string
}

export interface Menu {
    menuRenderer: MenuRenderer
}

export interface MenuRenderer {
    items: Item[]
    trackingParams: string
    topLevelButtons: TopLevelButton[]
    accessibility: Accessibility
}

export interface Item {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer
    menuServiceItemRenderer?: MenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer {
    text: Text3
    icon: Icon
    navigationEndpoint: NavigationEndpoint2
    trackingParams: string
}

export interface Text3 {
    runs: Run3[]
}

export interface Run3 {
    text: string
}

export interface Icon {
    iconType: string
}

export interface NavigationEndpoint2 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint
    browseEndpoint?: BrowseEndpoint2
    modalEndpoint?: ModalEndpoint
    watchEndpoint?: WatchEndpoint3
}

export interface ShareEntityEndpoint {
    serializedShareEntity: string
    sharePanelType: string
}

export interface BrowseEndpoint2 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs2
}

export interface BrowseEndpointContextSupportedConfigs2 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig2
}

export interface BrowseEndpointContextMusicConfig2 {
    pageType: string
}

export interface ModalEndpoint {
    modal: Modal
}

export interface Modal {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer
}

export interface ModalWithTitleAndButtonRenderer {
    title: Title
    content: Content4
    button: Button
}

export interface Title {
    runs: Run4[]
}

export interface Run4 {
    text: string
}

export interface Content4 {
    runs: Run5[]
}

export interface Run5 {
    text: string
}

export interface Button {
    buttonRenderer: ButtonRenderer
}

export interface ButtonRenderer {
    style: string
    isDisabled: boolean
    text: Text4
    navigationEndpoint: NavigationEndpoint3
    trackingParams: string
}

export interface Text4 {
    runs: Run6[]
}

export interface Run6 {
    text: string
}

export interface NavigationEndpoint3 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint
}

export interface SignInEndpoint {
    hack: boolean
}

export interface WatchEndpoint3 {
    videoId: string
    playlistId: string
    params: string
    loggingContext: LoggingContext3
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs3
}

export interface LoggingContext3 {
    vssLoggingContext: VssLoggingContext3
}

export interface VssLoggingContext3 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs3 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig3
}

export interface WatchEndpointMusicConfig3 {
    musicVideoType: string
}

export interface MenuServiceItemRenderer {
    text: Text5
    icon: Icon2
    serviceEndpoint: ServiceEndpoint
    trackingParams: string
}

export interface Text5 {
    runs: Run7[]
}

export interface Run7 {
    text: string
}

export interface Icon2 {
    iconType: string
}

export interface ServiceEndpoint {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint
}

export interface QueueAddEndpoint {
    queueTarget: QueueTarget
    queueInsertPosition: string
    commands: Command[]
}

export interface QueueTarget {
    videoId: string
    onEmptyQueue: OnEmptyQueue
}

export interface OnEmptyQueue {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint4
}

export interface WatchEndpoint4 {
    videoId: string
}

export interface Command {
    clickTrackingParams: string
    addToToastAction: AddToToastAction
}

export interface AddToToastAction {
    item: Item2
}

export interface Item2 {
    notificationTextRenderer: NotificationTextRenderer
}

export interface NotificationTextRenderer {
    successResponseText: SuccessResponseText
    trackingParams: string
}

export interface SuccessResponseText {
    runs: Run8[]
}

export interface Run8 {
    text: string
}

export interface TopLevelButton {
    likeButtonRenderer: LikeButtonRenderer
}

export interface LikeButtonRenderer {
    target: Target
    likeStatus: string
    trackingParams: string
    likesAllowed: boolean
    dislikeNavigationEndpoint: DislikeNavigationEndpoint
    likeCommand: LikeCommand
}

export interface Target {
    videoId: string
}

export interface DislikeNavigationEndpoint {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint2
}

export interface ModalEndpoint2 {
    modal: Modal2
}

export interface Modal2 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer2
}

export interface ModalWithTitleAndButtonRenderer2 {
    title: Title2
    content: Content5
    button: Button2
}

export interface Title2 {
    runs: Run9[]
}

export interface Run9 {
    text: string
}

export interface Content5 {
    runs: Run10[]
}

export interface Run10 {
    text: string
}

export interface Button2 {
    buttonRenderer: ButtonRenderer2
}

export interface ButtonRenderer2 {
    style: string
    isDisabled: boolean
    text: Text6
    navigationEndpoint: NavigationEndpoint4
    trackingParams: string
}

export interface Text6 {
    runs: Run11[]
}

export interface Run11 {
    text: string
}

export interface NavigationEndpoint4 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint2
}

export interface SignInEndpoint2 {
    hack: boolean
}

export interface LikeCommand {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint3
}

export interface ModalEndpoint3 {
    modal: Modal3
}

export interface Modal3 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer3
}

export interface ModalWithTitleAndButtonRenderer3 {
    title: Title3
    content: Content6
    button: Button3
}

export interface Title3 {
    runs: Run12[]
}

export interface Run12 {
    text: string
}

export interface Content6 {
    runs: Run13[]
}

export interface Run13 {
    text: string
}

export interface Button3 {
    buttonRenderer: ButtonRenderer3
}

export interface ButtonRenderer3 {
    style: string
    isDisabled: boolean
    text: Text7
    navigationEndpoint: NavigationEndpoint5
    trackingParams: string
}

export interface Text7 {
    runs: Run14[]
}

export interface Run14 {
    text: string
}

export interface NavigationEndpoint5 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint3
}

export interface SignInEndpoint3 {
    hack: boolean
}

export interface Accessibility {
    accessibilityData: AccessibilityData3
}

export interface AccessibilityData3 {
    label: string
}

export interface Badge {
    musicInlineBadgeRenderer: MusicInlineBadgeRenderer
}

export interface MusicInlineBadgeRenderer {
    trackingParams: string
    icon: Icon3
    accessibilityData: AccessibilityData4
}

export interface Icon3 {
    iconType: string
}

export interface AccessibilityData4 {
    accessibilityData: AccessibilityData5
}

export interface AccessibilityData5 {
    label: string
}

export interface PlaylistItemData {
    playlistSetVideoId: string
    videoId: string
    voteSortValue: number
}

export interface MultiSelectCheckbox {
    checkboxRenderer: CheckboxRenderer
}

export interface CheckboxRenderer {
    onSelectionChangeCommand: OnSelectionChangeCommand
    checkedState: string
    trackingParams: string
}

export interface OnSelectionChangeCommand {
    clickTrackingParams: string
    updateMultiSelectStateCommand: UpdateMultiSelectStateCommand
}

export interface UpdateMultiSelectStateCommand {
    multiSelectParams: string
    multiSelectItem: string
}

export interface Continuation {
    nextContinuationData: NextContinuationData
}

export interface NextContinuationData {
    continuation: string
    clickTrackingParams: string
}

export interface Continuation2 {
    nextContinuationData: NextContinuationData2
}

export interface NextContinuationData2 {
    continuation: string
    clickTrackingParams: string
}

export interface Tab {
    tabRenderer: TabRenderer
}

export interface TabRenderer {
    content: Content7
    trackingParams: string
}

export interface Content7 {
    sectionListRenderer: SectionListRenderer2
}

export interface SectionListRenderer2 {
    contents: Content8[]
    trackingParams: string
}

export interface Content8 {
    musicEditablePlaylistDetailHeaderRenderer: {
          header: {
            musicResponsiveHeaderRenderer: {
              thumbnail: {
                musicThumbnailRenderer: {
                  thumbnail: {
                    thumbnails: Array<{
                      url: string
                      width: number
                      height: number
                    }>
                  }
                  thumbnailCrop: string
                  thumbnailScale: string
                  trackingParams: string
                }
              }
              buttons: Array<{
                downloadButtonRenderer?: {
                  trackingParams: string
                  style: string
                  accessibilityData: {
                    accessibilityData: {
                      label: string
                    }
                  }
                  targetId: string
                  command: {
                    clickTrackingParams: string
                    offlinePlaylistEndpoint: {
                      playlistId: string
                      action: string
                      offlineability: {
                        offlineabilityRenderer: {
                          offlineable: boolean
                          clickTrackingParams: string
                        }
                      }
                      onAddCommand: {
                        clickTrackingParams: string
                        getDownloadActionCommand: {
                          playlistId: string
                          params: string
                        }
                      }
                    }
                  }
                }
                buttonRenderer?: {
                  style?: string
                  icon: {
                    iconType: string
                  }
                  accessibility?: {
                    label: string
                  }
                  trackingParams: string
                  accessibilityData: {
                    accessibilityData: {
                      label: string
                    }
                  }
                  command?: {
                    clickTrackingParams: string
                    confirmDialogEndpoint: {
                      content: {
                        confirmDialogRenderer: {
                          title: {
                            runs: Array<{
                              text: string
                            }>
                          }
                          trackingParams: string
                          dialogMessages: Array<{
                            runs: Array<{
                              text: string
                            }>
                          }>
                          confirmButton: {
                            buttonRenderer: {
                              style: string
                              isDisabled: boolean
                              text: {
                                runs: Array<{
                                  text: string
                                }>
                              }
                              trackingParams: string
                              command: {
                                clickTrackingParams: string
                                playlistEditorEndpoint: {
                                  playlistId: string
                                }
                              }
                            }
                          }
                          cancelButton: {
                            buttonRenderer: {
                              style: string
                              isDisabled: boolean
                              text: {
                                runs: Array<{
                                  text: string
                                }>
                              }
                              trackingParams: string
                            }
                          }
                        }
                      }
                    }
                  }
                  navigationEndpoint?: {
                    clickTrackingParams: string
                    playlistEditorEndpoint: {
                      playlistId: string
                    }
                  }
                  targetId?: string
                }
                musicPlayButtonRenderer?: {
                  playNavigationEndpoint: {
                    clickTrackingParams: string
                    watchEndpoint: {
                      videoId: string
                      playlistId: string
                      params: string
                      playerParams: string
                      loggingContext: {
                        vssLoggingContext: {
                          serializedContextData: string
                        }
                      }
                      watchEndpointMusicSupportedConfigs: {
                        watchEndpointMusicConfig: {
                          musicVideoType: string
                        }
                      }
                    }
                  }
                  trackingParams: string
                  playIcon: {
                    iconType: string
                  }
                  pauseIcon: {
                    iconType: string
                  }
                  iconColor: number
                  backgroundColor: number
                  activeBackgroundColor: number
                  loadingIndicatorColor: number
                  playingIcon: {
                    iconType: string
                  }
                  iconLoadingColor: number
                  activeScaleFactor: number
                  accessibilityPlayData: {
                    accessibilityData: {
                      label: string
                    }
                  }
                  accessibilityPauseData: {
                    accessibilityData: {
                      label: string
                    }
                  }
                }
                menuRenderer?: {
                  items: Array<{
                    menuNavigationItemRenderer?: {
                      text: {
                        runs: Array<{
                          text: string
                        }>
                      }
                      icon: {
                        iconType: string
                      }
                      navigationEndpoint: {
                        clickTrackingParams: string
                        confirmDialogEndpoint?: {
                          content: {
                            confirmDialogRenderer: {
                              title: {
                                runs: Array<{
                                  text: string
                                }>
                              }
                              trackingParams: string
                              dialogMessages: Array<{
                                runs: Array<{
                                  text: string
                                }>
                              }>
                              confirmButton: {
                                buttonRenderer: {
                                  style: string
                                  size?: string
                                  isDisabled: boolean
                                  text: {
                                    runs: Array<{
                                      text: string
                                    }>
                                  }
                                  serviceEndpoint?: {
                                    clickTrackingParams: string
                                    deletePlaylistEndpoint: {
                                      playlistId: string
                                    }
                                  }
                                  trackingParams: string
                                  command?: {
                                    clickTrackingParams: string
                                    playlistEditorEndpoint: {
                                      playlistId: string
                                    }
                                  }
                                }
                              }
                              cancelButton: {
                                buttonRenderer: {
                                  style: string
                                  size?: string
                                  isDisabled: boolean
                                  text: {
                                    runs: Array<{
                                      text: string
                                    }>
                                  }
                                  trackingParams: string
                                }
                              }
                            }
                          }
                        }
                        addToPlaylistEndpoint?: {
                          playlistId: string
                        }
                        watchPlaylistEndpoint?: {
                          playlistId: string
                          params: string
                        }
                      }
                      trackingParams: string
                    }
                    menuServiceItemRenderer?: {
                      text: {
                        runs: Array<{
                          text: string
                        }>
                      }
                      icon: {
                        iconType: string
                      }
                      serviceEndpoint: {
                        clickTrackingParams: string
                        queueAddEndpoint: {
                          queueTarget: {
                            playlistId: string
                            onEmptyQueue: {
                              clickTrackingParams: string
                              watchEndpoint: {
                                playlistId: string
                              }
                            }
                          }
                          queueInsertPosition: string
                          commands: Array<{
                            clickTrackingParams: string
                            addToToastAction: {
                              item: {
                                notificationTextRenderer: {
                                  successResponseText: {
                                    runs: Array<{
                                      text: string
                                    }>
                                  }
                                  trackingParams: string
                                }
                              }
                            }
                          }>
                        }
                      }
                      trackingParams: string
                    }
                    menuServiceItemDownloadRenderer?: {
                      serviceEndpoint: {
                        clickTrackingParams: string
                        offlinePlaylistEndpoint: {
                          playlistId: string
                          action: string
                          offlineability: {
                            offlineabilityRenderer: {
                              offlineable: boolean
                              clickTrackingParams: string
                            }
                          }
                          onAddCommand: {
                            clickTrackingParams: string
                            getDownloadActionCommand: {
                              playlistId: string
                              params: string
                            }
                          }
                        }
                      }
                      trackingParams: string
                    }
                  }>
                  trackingParams: string
                  accessibility: {
                    accessibilityData: {
                      label: string
                    }
                  }
                }
              }>
              title: {
                runs: Array<{
                  text: string
                }>
              }
              subtitle: {
                runs: Array<{
                  text: string
                }>
              }
              trackingParams: string
              straplineTextOne: {
                runs: Array<{
                  text: string
                  navigationEndpoint: {
                    clickTrackingParams: string
                    browseEndpoint: {
                      browseId: string
                      browseEndpointContextSupportedConfigs: {
                        browseEndpointContextMusicConfig: {
                          pageType: string
                        }
                      }
                    }
                  }
                }>
              }
              straplineThumbnail: {
                musicThumbnailRenderer: {
                  thumbnail: {
                    thumbnails: Array<{
                      url: string
                      width: number
                      height: number
                    }>
                  }
                  thumbnailCrop: string
                  thumbnailScale: string
                  trackingParams: string
                }
              }
              secondSubtitle: {
                runs: Array<{
                  text: string
                }>
              }
            }
          }
          editHeader: {
            musicPlaylistEditHeaderRenderer: {
              title: {
                runs: Array<{
                  text: string
                }>
              }
              editTitle: {
                runs: Array<{
                  text: string
                }>
              }
              editDescription: {
                runs: Array<{
                  text: string
                }>
              }
              privacy: string
              trackingParams: string
              playlistId: string
              collaborationSettingsDisabled: boolean
              collaborationSettingsCommand: {
                clickTrackingParams: string
                confirmDialogEndpoint: {
                  content: {
                    confirmDialogRenderer: {
                      title: {
                        runs: Array<{
                          text: string
                        }>
                      }
                      trackingParams: string
                      dialogMessages: Array<{
                        runs: Array<{
                          text: string
                        }>
                      }>
                      confirmButton: {
                        buttonRenderer: {
                          style: string
                          isDisabled: boolean
                          text: {
                            runs: Array<{
                              text: string
                            }>
                          }
                          trackingParams: string
                        }
                      }
                    }
                  }
                }
              }
              privacyDropdown: {
                dropdownRenderer: {
                  entries: Array<{
                    dropdownItemRenderer: {
                      label: {
                        runs: Array<{
                          text: string
                        }>
                      }
                      isSelected: boolean
                      accessibility: {
                        label: string
                      }
                      stringValue: string
                      icon: {
                        iconType: string
                      }
                      descriptionText: {
                        runs: Array<{
                          text: string
                        }>
                      }
                    }
                  }>
                  label: string
                  accessibility: {
                    label: string
                  }
                }
              }
              playlistCollaborationEntityKey: string
            }
          }
          trackingParams: string
          playlistId: string
        }
    musicResponsiveHeaderRenderer: MusicResponsiveHeaderRenderer
}

export interface MusicResponsiveHeaderRenderer {
    thumbnail: Thumbnail4
    buttons: Button4[]
    title: Title7
    subtitle: Subtitle
    trackingParams: string
    straplineTextOne: StraplineTextOne
    straplineThumbnail: StraplineThumbnail
    secondSubtitle: SecondSubtitle
}

export interface Thumbnail4 {
    musicThumbnailRenderer: MusicThumbnailRenderer2
}

export interface MusicThumbnailRenderer2 {
    thumbnail: Thumbnail5
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail5 {
    thumbnails: Thumbnail6[]
}

export interface Thumbnail6 {
    url: string
    width: number
    height: number
}

export interface Button4 {
    toggleButtonRenderer?: ToggleButtonRenderer
    musicPlayButtonRenderer?: MusicPlayButtonRenderer2
    menuRenderer?: MenuRenderer2
}

export interface ToggleButtonRenderer {
    isToggled: boolean
    isDisabled: boolean
    defaultIcon: DefaultIcon
    toggledIcon: ToggledIcon
    trackingParams: string
    defaultNavigationEndpoint: DefaultNavigationEndpoint
    accessibilityData: AccessibilityData6
    toggledAccessibilityData: ToggledAccessibilityData
}

export interface DefaultIcon {
    iconType: string
}

export interface ToggledIcon {
    iconType: string
}

export interface DefaultNavigationEndpoint {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint4
}

export interface ModalEndpoint4 {
    modal: Modal4
}

export interface Modal4 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer4
}

export interface ModalWithTitleAndButtonRenderer4 {
    title: Title4
    content: Content9
    button: Button5
}

export interface Title4 {
    runs: Run15[]
}

export interface Run15 {
    text: string
}

export interface Content9 {
    runs: Run16[]
}

export interface Run16 {
    text: string
}

export interface Button5 {
    buttonRenderer: ButtonRenderer4
}

export interface ButtonRenderer4 {
    style: string
    isDisabled: boolean
    text: Text8
    navigationEndpoint: NavigationEndpoint6
    trackingParams: string
}

export interface Text8 {
    runs: Run17[]
}

export interface Run17 {
    text: string
}

export interface NavigationEndpoint6 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint4
}

export interface SignInEndpoint4 {
    hack: boolean
}

export interface AccessibilityData6 {
    accessibilityData: AccessibilityData7
}

export interface AccessibilityData7 {
    label: string
}

export interface ToggledAccessibilityData {
    accessibilityData: AccessibilityData8
}

export interface AccessibilityData8 {
    label: string
}

export interface MusicPlayButtonRenderer2 {
    playNavigationEndpoint: PlayNavigationEndpoint2
    trackingParams: string
    playIcon: PlayIcon2
    pauseIcon: PauseIcon2
    iconColor: number
    backgroundColor: number
    activeBackgroundColor: number
    loadingIndicatorColor: number
    playingIcon: PlayingIcon2
    iconLoadingColor: number
    activeScaleFactor: number
    accessibilityPlayData: AccessibilityPlayData2
    accessibilityPauseData: AccessibilityPauseData2
}

export interface PlayNavigationEndpoint2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint5
}

export interface WatchEndpoint5 {
    videoId: string
    playlistId: string
    params: string
    playerParams: string
    loggingContext: LoggingContext4
    watchEndpointMusicSupportedConfigs: WatchEndpointMusicSupportedConfigs4
}

export interface LoggingContext4 {
    vssLoggingContext: VssLoggingContext4
}

export interface VssLoggingContext4 {
    serializedContextData: string
}

export interface WatchEndpointMusicSupportedConfigs4 {
    watchEndpointMusicConfig: WatchEndpointMusicConfig4
}

export interface WatchEndpointMusicConfig4 {
    musicVideoType: string
}

export interface PlayIcon2 {
    iconType: string
}

export interface PauseIcon2 {
    iconType: string
}

export interface PlayingIcon2 {
    iconType: string
}

export interface AccessibilityPlayData2 {
    accessibilityData: AccessibilityData9
}

export interface AccessibilityData9 {
    label: string
}

export interface AccessibilityPauseData2 {
    accessibilityData: AccessibilityData10
}

export interface AccessibilityData10 {
    label: string
}

export interface MenuRenderer2 {
    items: Item3[]
    trackingParams: string
    accessibility: Accessibility2
}

export interface Item3 {
    menuNavigationItemRenderer?: MenuNavigationItemRenderer2
    menuServiceItemRenderer?: MenuServiceItemRenderer2
    toggleMenuServiceItemRenderer?: ToggleMenuServiceItemRenderer
}

export interface MenuNavigationItemRenderer2 {
    text: Text9
    icon: Icon4
    navigationEndpoint: NavigationEndpoint7
    trackingParams: string
}

export interface Text9 {
    runs: Run18[]
}

export interface Run18 {
    text: string
}

export interface Icon4 {
    iconType: string
}

export interface NavigationEndpoint7 {
    clickTrackingParams: string
    shareEntityEndpoint?: ShareEntityEndpoint2
    modalEndpoint?: ModalEndpoint5
    watchPlaylistEndpoint?: WatchPlaylistEndpoint
}

export interface ShareEntityEndpoint2 {
    serializedShareEntity: string
    sharePanelType: string
}

export interface ModalEndpoint5 {
    modal: Modal5
}

export interface Modal5 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer5
}

export interface ModalWithTitleAndButtonRenderer5 {
    title: Title5
    content: Content10
    button: Button6
}

export interface Title5 {
    runs: Run19[]
}

export interface Run19 {
    text: string
}

export interface Content10 {
    runs: Run20[]
}

export interface Run20 {
    text: string
}

export interface Button6 {
    buttonRenderer: ButtonRenderer5
}

export interface ButtonRenderer5 {
    style: string
    isDisabled: boolean
    text: Text10
    navigationEndpoint: NavigationEndpoint8
    trackingParams: string
}

export interface Text10 {
    runs: Run21[]
}

export interface Run21 {
    text: string
}

export interface NavigationEndpoint8 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint5
}

export interface SignInEndpoint5 {
    hack: boolean
}

export interface WatchPlaylistEndpoint {
    playlistId: string
    params: string
}

export interface MenuServiceItemRenderer2 {
    text: Text11
    icon: Icon5
    serviceEndpoint: ServiceEndpoint2
    trackingParams: string
}

export interface Text11 {
    runs: Run22[]
}

export interface Run22 {
    text: string
}

export interface Icon5 {
    iconType: string
}

export interface ServiceEndpoint2 {
    clickTrackingParams: string
    queueAddEndpoint: QueueAddEndpoint2
}

export interface QueueAddEndpoint2 {
    queueTarget: QueueTarget2
    queueInsertPosition: string
    commands: Command2[]
}

export interface QueueTarget2 {
    playlistId: string
    onEmptyQueue: OnEmptyQueue2
}

export interface OnEmptyQueue2 {
    clickTrackingParams: string
    watchEndpoint: WatchEndpoint6
}

export interface WatchEndpoint6 {
    playlistId: string
}

export interface Command2 {
    clickTrackingParams: string
    addToToastAction: AddToToastAction2
}

export interface AddToToastAction2 {
    item: Item4
}

export interface Item4 {
    notificationTextRenderer: NotificationTextRenderer2
}

export interface NotificationTextRenderer2 {
    successResponseText: SuccessResponseText2
    trackingParams: string
}

export interface SuccessResponseText2 {
    runs: Run23[]
}

export interface Run23 {
    text: string
}

export interface ToggleMenuServiceItemRenderer {
    defaultText: DefaultText
    defaultIcon: DefaultIcon2
    defaultServiceEndpoint: DefaultServiceEndpoint
    toggledText: ToggledText
    toggledIcon: ToggledIcon2
    toggledServiceEndpoint: ToggledServiceEndpoint
    trackingParams: string
}

export interface DefaultText {
    runs: Run24[]
}

export interface Run24 {
    text: string
}

export interface DefaultIcon2 {
    iconType: string
}

export interface DefaultServiceEndpoint {
    clickTrackingParams: string
    modalEndpoint: ModalEndpoint6
}

export interface ModalEndpoint6 {
    modal: Modal6
}

export interface Modal6 {
    modalWithTitleAndButtonRenderer: ModalWithTitleAndButtonRenderer6
}

export interface ModalWithTitleAndButtonRenderer6 {
    title: Title6
    content: Content11
    button: Button7
}

export interface Title6 {
    runs: Run25[]
}

export interface Run25 {
    text: string
}

export interface Content11 {
    runs: Run26[]
}

export interface Run26 {
    text: string
}

export interface Button7 {
    buttonRenderer: ButtonRenderer6
}

export interface ButtonRenderer6 {
    style: string
    isDisabled: boolean
    text: Text12
    navigationEndpoint: NavigationEndpoint9
    trackingParams: string
}

export interface Text12 {
    runs: Run27[]
}

export interface Run27 {
    text: string
}

export interface NavigationEndpoint9 {
    clickTrackingParams: string
    signInEndpoint: SignInEndpoint6
}

export interface SignInEndpoint6 {
    hack: boolean
}

export interface ToggledText {
    runs: Run28[]
}

export interface Run28 {
    text: string
}

export interface ToggledIcon2 {
    iconType: string
}

export interface ToggledServiceEndpoint {
    clickTrackingParams: string
    likeEndpoint: LikeEndpoint
}

export interface LikeEndpoint {
    status: string
    target: Target2
}

export interface Target2 {
    playlistId: string
}

export interface Accessibility2 {
    accessibilityData: AccessibilityData11
}

export interface AccessibilityData11 {
    label: string
}

export interface Title7 {
    runs: Run29[]
}

export interface Run29 {
    text: string
}

export interface Subtitle {
    runs: Run30[]
}

export interface Run30 {
    text: string
}

export interface StraplineTextOne {
    runs: Run31[]
}

export interface Run31 {
    text: string
    navigationEndpoint: NavigationEndpoint10
}

export interface NavigationEndpoint10 {
    clickTrackingParams: string
    browseEndpoint: BrowseEndpoint3
}

export interface BrowseEndpoint3 {
    browseId: string
    browseEndpointContextSupportedConfigs: BrowseEndpointContextSupportedConfigs3
}

export interface BrowseEndpointContextSupportedConfigs3 {
    browseEndpointContextMusicConfig: BrowseEndpointContextMusicConfig3
}

export interface BrowseEndpointContextMusicConfig3 {
    pageType: string
}

export interface StraplineThumbnail {
    musicThumbnailRenderer: MusicThumbnailRenderer3
}

export interface MusicThumbnailRenderer3 {
    thumbnail: Thumbnail7
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail7 {
    thumbnails: Thumbnail8[]
}

export interface Thumbnail8 {
    url: string
    width: number
    height: number
}

export interface SecondSubtitle {
    runs: Run32[]
}

export interface Run32 {
    text: string
}

export interface Background2 {
    musicThumbnailRenderer: MusicThumbnailRenderer4
}

export interface MusicThumbnailRenderer4 {
    thumbnail: Thumbnail9
    thumbnailCrop: string
    thumbnailScale: string
    trackingParams: string
}

export interface Thumbnail9 {
    thumbnails: Thumbnail10[]
}

export interface Thumbnail10 {
    url: string
    width: number
    height: number
}
