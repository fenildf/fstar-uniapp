1<template>
	<view>
		<view class="header">
			<picker class="header-item" :range="course.years" :value="currentSemesterIndex" @change="handleSemesterChange">
				{{currentSemester}}
			</picker>
			<picker :range="week" :value="weekIndex" class="header-item" @change="weekChange">第{{week[weekIndex]}}周</picker>
			<view class="header-item refresh-button" type="primary" @click="onRefresh">刷新</view>
		</view>
		<view class="table-header">
			<view v-for="index in 8" :key="index" :class="{'table-header-item':true,'table-header-item-left':index==0}">
				<view class="header-item-wrap">
					<view v-if="index==0">
						{{dateData[7*(currentWeek-1)].getMonth() + 1}}\n月
					</view>
					<view v-else :class="{'today':new Date().setHours(0,0,0,0)==dateData[(index-1)+(currentWeek-1)*7].setHours(0,0,0,0)}">
						<view>
							周{{getDayOfWeek(index)}}
						</view>
						<view>
							{{dateData[(index-1)+(currentWeek-1)*7].getDate()}}
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="table">
			<view v-for="column in 8" :class="{'table-item-wrap':true,'table-item-left-wrap':column==0}" :key="column">
				<view v-for="row in 5" :key="row">
					<view v-if="column!==0" :class="{'table-item':true,'table-item-inactive': !tableData[(row+1)*2-1][column]}" :style="{'background-color': colorList()[tableData[(row+1)*2-1][column][0].colorIndex]}"
					 @click="handleDetailTap(row,column)">
						{{tableData[(row+1)*2-1][column][0].name}}@{{tableData[(row+1)*2-1][column][0].classroom}}
					</view>
					<view v-else class="table-item-left table-item">
						<view class="time">
							{{row+1}}
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="remark">
			{{remark}}
		</view>
		<w-loading click="false" mask="false" ref="loading"></w-loading>
		<uni-popup ref="detail">
			<view class="dialog">
				<view style="text-align: center;">详情\n</view>
				<text>课程名称：{{detailCourse.name}}\n</text>
				<text>课程号：{{detailCourse.id}}\n</text>
				<text>教室：{{detailCourse.classroom}}\n</text>
				<text>周次：{{getRawWeek(detailCourse.week)}}\n</text>
				<text>节数：星期{{detailCourse.column}} 第{{(detailCourse.row+1)/2}}节\n</text>
				<text>老师：{{detailCourse.teacher}}\n</text>
				<button type="primary" class="dialgo-button" @click="closeDetail">确定</button>
			</view>
		</uni-popup>
		<uni-popup ref="more">
			<view class="dialog">
				<view style="text-align: center;">多个课程</view>
				<view v-for="course in moreCourse" :key="course.id">
					<button type="primary" class="dialgo-button" @click="openDetail(course)"></button>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="message" type="top">
			<view class="message">
				{{message}}
			</view>
		</uni-popup>
	</view>
</template>

<script>
	const app = getApp()
	export default {
		data() {
			return {
				title: '繁星课程表',
				currentSemester: "",
				weekIndex: 0,
				moreCourse: [],
				detailCourse: {
					week: []
				},
				beginTime: new Date().getTime(),
				course: app.globalData.course,
				message: "发生了错误",
				colorIndex: 0,
				idColorMap: new Map(),
			}
		},
		onLoad() {
			console.log("课表页 onLoad")
		},
		onShow() {
			console.log("课表页 onShow")
			this.colorIndex = 0
			const globalData = app.globalData
			this.course = globalData.course
			this.currentSemester = globalData.settings.currentSemester
			this.beginTime = globalData.settings.beginTime

			// if (!this.beginTime) {
			// 	this.beginTime = new Date().getTime()
			// 	globalData.settings.beginTime = this.beginTime
			// }

			let beginTime = this.beginTime
			let now = new Date().getTime()
			let detal = now - beginTime
			let correctWeekIndex = parseInt(detal / 1000 / 60 / 60 / 24 / 7)
			if (correctWeekIndex >= this.week.length) {
				correctWeekIndex = this.week.length - 1
			}
			if (correctWeekIndex < 0) {
				correctWeekIndex = 0
			}
			this.weekIndex = correctWeekIndex
		},
		computed: {
			currentSemesterIndex() {
				return this.course.years.indexOf(this.currentSemester)
			},
			week() {
				return Array.from(new Array(this.course.week), (x, i) => i + 1)
			},
			currentWeek() {
				return this.week[this.weekIndex]
			},
			remark() {
				if (this.course.remark) {
					return this.course.remark
				} else {
					return "备注："
				}
			},
			dateData() {
				let beginTime = new Date(this.beginTime)
				const day = 24 * 60 * 60 * 1000
				let timeTable = []
				for (let i = 0; i < 30 * 7; ++i) {
					timeTable.push(new Date(i * day + this.beginTime))
				}
				return timeTable
			},
			tableData() {
				let data = {}
				let course = this.course.course.filter((c) => c.week.indexOf(this.currentWeek) !== -1)
				for (let c of course) {
					if (!data[c.row]) {
						data[c.row] = []
					}
					if (!data[c.row][c.column]) {
						data[c.row][c.column] = []
					}
					if (!this.idColorMap.has(c.id)) {
						this.idColorMap.set(c.id, this.colorIndex)
						this.colorIndex = ++this.colorIndex % this.colorList().length
					}
					c.colorIndex = this.idColorMap.get(c.id)
					data[c.row][c.column].push(c)
				}
				return data
			}
		},
		methods: {
			open() {
				this.$refs.loading.open()
			},
			getRawWeek(weekList) {
				let ordered = new Set(weekList)
				let begin = -1
				let result = []
				for (let i = weekList[0]; i <= weekList[weekList.length - 1] + 1; ++i) {
					if (ordered.has(i) && begin == -1) {
						begin = i
					}
					if (!ordered.has(i) && begin != -1) {
						if (begin == i - 1) {
							result.push(`${begin}`);
						} else {
							result.push(`${begin}-${i - 1}`);
						}
						begin = -1
					}
				}
				return result.join(',') + '(周)'
			},
			closeDialog() {
				this.$refs.popup.close()
			},
			handleSemesterChange(e) {
				this.currentSemester = this.course.years[e.detail.value]
				try {
					this.$refs.loading.open()
					let url = app.globalData.host
					if (app.globalData.settings.useVPN) {
						url += "/vpn"
					} else {
						url += "/just"
					}
					url += "/course"
					let loginData = uni.getStorageSync("login_key")
					if (!loginData) {
						this.message = "请先在设置中验证账号"
						this.$refs.message.open()
						this.$refs.loading.close()
						return
					}
					loginData.kksj = this.currentSemester
					uni.request({
						url: url,
						method: "GET",
						data: loginData,
						success: (res) => {
							let response = res.data
							if (response.code !== 200) {
								console.log(response.message)
								this.message = response.message
								this.$refs.message.open()
							} else {
								console.log("success")
								uni.setStorage({
									key: "course_key",
									data: response.data,
								})
								app.globalData.course = response.data
								app.globalData.settings.currentSemester = loginData.kksj
								app.globalData.settings.scoreQuerySemester = loginData.kksj
								uni.setStorage({
									key: "settings_key",
									data: app.globalData.settings
								})
								this.course = app.globalData.course
							}
							this.$refs.loading.close()
						}
					})
				} catch (e) {
					console.log(e)
					this.$refs.loading.close()
					this.message = "发生了错误"
					this.$refs.message.open()
				}
			},
			onRefresh() {
				console.log("refresh")
				console.log(this.currentSemester)
				this.handleSemesterChange({
					detail: {
						value: this.course.years.indexOf(this.currentSemester)
					}
				})
			},
			handleDetailTap(row, column) {
				let course = this.tableData[(row + 1) * 2 - 1][column]
				if (course.length > 1) {
					this.moreCourse = course
					this.$refs.more.open()
				} else {
					this.openDetail(course[0])
				}
			},
			weekChange(e) {
				this.weekIndex = e.detail.value
			},
			openDetail(course) {
				console.log(course)
				this.detailCourse = course
				this.$refs.detail.open()
			},
			closeDetail() {
				this.$refs.detail.close()
			},
			colorList() {
				return [
					"#00CCFF", //0
					"#8D4BBB", //1
					"#33CC99",
					"#EF7A82", //3
					"#789262", //4
					"#66CCCC", //5
					"#9999FF", //6
					"#6699CC", //7
					"#88ADA6", //8
					"#9D2933", //9
					"#758a99", //10
					"#549688", //11
					"#815476", //12
					"#4b5cc4", //13
					"#DB5A6B", //14
					"#FF00CC", //15
					"#C83C23", //16
					"#44CEF6", //17
				]
			},
			getDayOfWeek(index) {
				switch (index) {
					case 1:
						return "一"
					case 2:
						return "二"
					case 3:
						return "三"
					case 4:
						return "四"
					case 5:
						return "五"
					case 6:
						return "六"
					case 7:
						return "日"
				}
			}
		},
	}
</script>

<style>
	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}

	.dialog {
		position: relative;
		background-color: #fafafa;
		width: 500rpx;
		border-radius: 20rpx;
		font-size: .8em;
		text-align: center;
		line-height: 1.5em;
		padding: 20rpx;
	}

	.dialgo-button {
		margin: 20rpx;
		/* position: absolute; */
		/* bottom: 10rpx; */
		left: 0;
		right: 0;
	}

	.header {
		display: flex;
		font-size: 0.8em;
		margin: 20rpx;
		/* padding: 20rpx; */
		text-align: center;
	}

	.header-item {
		align-self: center;
		margin-left: 10rpx;
		margin-right: 10rpx;
		flex: 1;
	}

	.refresh-button {
		/* height: 60rpx; */
		align-items: center;
		align-self: center;
		justify-items: center;
		justify-self: center;
		border-radius: 20rpx;
		padding: 2rpx;
		border: #00AAFF solid .1rpx;
		border-radius: 20rpx;
	}

	.remark {
		font-size: .7em;
		text-align: left;
		padding: 10rpx;
		border: #cecece solid .1rpx;
	}

	.table-header {
		display: flex;
		text-align: center;
		font-size: .7em;
		border: #E4E7ED .1rpx solid;
		padding: 10rpx;
	}

	.table {
		display: flex;
		text-align: center;
		background-color: #fdfdfd;
	}

	.table-header-item {
		/* background-color: #007AFF; */
		flex: 2;

		/* width: 100rpx; */

	}

	.table-item-wrap {
		flex: 2;
		/* margin: 10rpx; */
	}

	.table-item-left-wrap {
		flex: 1;
	}

	.table-header-item-left {
		flex: 1;
		/* width: 200rpx; */
		/* background-color: #DD524D; */
	}

	.table-item {
		/* margin: 8rpx; */
		margin-top: 8rpx;
		margin-bottom: 8rpx;
		margin-left: 4rpx;
		margin-right: 4rpx;
		/* background-color: #BA55D3; */
		border-radius: 8rpx;
		box-shadow: 1px 1px 2px .1px #b6b6b6;
		height: 270rpx;
		text-align: center;
		align-self: center;
		justify-content: center;
		word-break: break-all;
		overflow: hidden;
		font-size: .7em;
		padding: 1rpx;
		color: #EBEEF5;
		box-sizing: border-box;
	}

	.table-item-left {
		/* background-color: #55aaff; */
		box-sizing: border-box;
		border: #BCBEC2 1rpx dashed;
		margin-top: 8rpx;
		margin-bottom: 8rpx;
		color: #040038;
		border-radius: 5rpx;
		margin-left: 0;
		margin-right: 0;
		position: relative;
		font-size: .8em;
		padding: 1rpx;
		box-shadow: 0 0px 0px #ccc;
		display: flex;
	}

	.table-item-inactive {
		background-color: #4CD964;
		visibility: hidden;
	}

	.time {
		text-align: center;
		align-self: center;
		margin: 5rpx;
	}

	.today {
		background-color: #00aaff;
		border-radius: 10rpx;
	}
</style>
