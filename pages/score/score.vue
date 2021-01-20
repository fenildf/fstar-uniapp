<template>
	<view>
		<view class="header">
			<picker @change="bindPickerChange" :value="semester" :range="semesterList">
				<view class="current-semester">学期 {{semester}}</view>
			</picker>
			<button class="query-button" @click="handleQuery" type="primary">查询</button>
		</view>
		<view v-if="scoreData.length>0" class="gpa-view">
			<view class="gpa-info">
				<view v-for="gpa in gpaInfo" :key="gpa">
					<text>{{gpa}}</text>
				</view>
			</view>
			<view class="gpa-mode">
				<uni-data-checkbox v-model="funcIndex" :localdata="range" @change="modeChange"></uni-data-checkbox>
			</view>
		</view>
		<view class="score-view">
			<checkbox-group @change="checkboxGroupChange">
				<view v-for="(score,index) in scoreData" :key="score.no" class="score-wrap" @click="handleDetailTap(score)">
					<block>
						<view class="item">
							{{index+1}}
						</view>
						<view class="item">
							{{score.name}}
						</view>
						<view class="item">
							{{score.score}}
						</view>
						<view v-if="manual" class="item">
							<checkbox :value="index"></checkbox>
						</view>
					</block>
				</view>
			</checkbox-group>
		</view>
		<uni-popup ref="popup">
			<scroll-view scroll-y="true" class="dialog">
				<text>详情\n</text>
				<text>课程号 {{detail.scoreNo}}\n</text>
				<text>课程名称 {{detail.name}}\n</text>
				<text>开课学期 {{detail.semester}}\n</text>
				<text>成绩 {{detail.score}}\n</text>
				<text>学分 {{detail.credit}}\n</text>
				<text>总学时 {{detail.period}}\n</text>
				<text>考核方式 {{detail.evaluationMode}}\n</text>
				<text>课程属性 {{detail.courseProperty}}\n</text>
				<text>课程性质 {{detail.courseNature}}\n</text>
				<text>替代课程号 {{detail.alternativeCourseNumber}}\n</text>
				<text>替代课程名 {{detail.alternativeCourseName}}\n</text>
				<text>成绩标志 {{detail.scoreFlag}}\n</text>
				<button type="primary" class="dialog-button" @click="closeDialog">确定</button>
			</scroll-view>
		</uni-popup>
		<w-loading click="false" ref="loading"></w-loading>
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
				scoreData: app.globalData.score,
				detail: {},
				semester: app.globalData.settings.scoreQuerySemester,
				years: app.globalData.course.years,
				calculateMode: "必修绩点",
				selected: [],
				selectedIndex: [],
				calculateFunc: {
					0: (score) => {
						if (score.name.indexOf("体育") === -1 && score.courseProperty === "必修") {
							return true
						} else {
							return false
						}
					},
					1: (score) => {
						if (score.name.indexOf("体育") === -1 && score.courseProperty === "必修" || score.courseProperty === "任选") {
							return true
						} else {
							return false
						}
					},
					2: (score) => true,
					3: (score) => true,
				},
				manual: false,
				funcIndex: 0,
				range: [{
						"value": 0,
						"text": "必修"
					}, {
						"value": 1,
						"text": "必修任选"
					}, {
						"value": 2,
						"text": "全部",
					},
					{
						"value": 3,
						"text": "自选",
					}
				],
				message: "发生了错误",
			}
		},
		computed: {
			semesterList() {
				return ["全部", ...this.years]
			},
			gpaInfo() {
				console.log("calculate gpa")
				if (this.funcIndex == 3) {
					return this.calculateGpa(this.calculateFunc[this.funcIndex], this.selected)
				}
				return this.calculateGpa(this.calculateFunc[this.funcIndex], this.scoreData)
			}
		},
		onShow() {
			this.years = app.globalData.course.years
		},
		methods: {
			handleQuery(e) {
				this.$refs.loading.open()
				const loginData = uni.getStorageSync("login_key")
				if (!loginData) {
					this.message = "请先在设置中验证账号"
					this.$refs.message.open()
					this.$refs.loading.close()
					return
				}
				loginData.xsfs = app.globalData.settings.maxScore ? "MAX" : "ALL"
				loginData.kksj = this.semester == "全部" ? "" : this.semester
				console.log(loginData)
				let url = app.globalData.host
				if (app.globalData.settings.useVPN) {
					url += "/vpn"
				} else {
					url += "/just"
				}
				url += "/score"
				if (!app.globalData.settings.defaultScoreQuery) {
					url += "2"
				}
				try {
					uni.request({
						method: "GET",
						url: url,
						data: loginData,
						success: (res) => {
							console.log(res)
							let response = res.data
							if (response.code === 200) {
								this.scoreData.length = 0
								this.scoreData.push(...response.data.reverse())
								uni.setStorage({
									key: "score_key",
									data: this.scoreData
								})
								this.calculateGpa((score) => true, this.scoreData)
							} else {
								this.message = response.message
								this.$refs.message.open()
							}
							this.$refs.loading.close()
						},
						fail: (res) => {
							this.$refs.loading.close()
							this.message = "发生了错误"
							this.$refs.message.open()
						}
					})
				} catch (e) {
					console.log(e)
					this.$refs.loading.close()
					this.message = "发生了错误"
					this.$refs.message.open()
				}
			},
			handleDetailTap(score) {
				console.log('tap')
				if (this.funcIndex === 3) {
					return
				}
				this.detail = score
				this.$refs.popup.open()
			},
			closeDialog() {
				this.$refs.popup.close()
			},
			bindPickerChange(e) {
				let index = e.detail.value
				let selectedSemester = this.semesterList[index]
				console.log(selectedSemester)
				this.semester = selectedSemester
				app.globalData.settings.scoreQuerySemester = selectedSemester
				uni.setStorage({
					key: "settings_key",
					data: app.globalData.settings,
				})
			},
			calculateGpa(predicate, scoreList) {
				let semesters = new Map()
				for (let score of scoreList) {
					if (!semesters.has(score.semester)) {
						semesters.set(score.semester, [])
					}
					semesters.get(score.semester).push(score)
				}
				let result = []
				if (app.globalData.settings.maxScore && app.globalData.settings.defaultScoreQuery) {
					result.push("最好成绩(绩点可作参考)")
				} else {
					result.push("非最好成绩(绩点不作参考)")
				}
				result.push(this.calculateMode)
				// console.log(semesters)
				let totalGPA = 0.0
				let totalUp = 0.0
				let totalDown = 0.0

				let yearGPA = 0.0
				let yearUp = 0.0
				let yearDown = 0.0

				let toggleYear = 0
				for (let [semester, scoreList] of semesters) {
					let up = 0.0
					let down = 0.0
					let gpa = 0.0
					scoreList.forEach((score) => {
						if (predicate(score)) {
							if (score.score === "优") {
								up += parseFloat(score.credit) * (95 / 10 - 5)
							}
							if (score.score === "良") {
								up += parseFloat(score.credit) * (85 / 10 - 5);
							}
							if (score.score === "中" || score.score === "合格") {
								up += parseFloat(score.credit) * (75 / 10 - 5);
							}
							if (score.score === "及格") {
								up += parseFloat(score.credit) * (65 / 10 - 5);
							}
							if (score.score === "通过") {
								up += parseFloat(score.credit) * (75 / 10 - 5);
							}
							try {
								if (parseFloat(score.score) >= 60) {
									up += parseFloat(score.credit) *
										(parseFloat(score.score) / 10 - 5);
								}
							} catch (e) {
								console.log(e)
							} finally {
								down += parseFloat(score.credit);
							}
						}
					})
					totalUp += up
					totalDown += down

					if (semesters.has(semester.substr(0, semester.length - 1) + "2")) {
						toggleYear++
						yearUp += up
						yearDown += down
					}
					gpa = up / down;
					result.push(`${semester}学期平均绩点：${gpa.toFixed(3)}`);
					if (toggleYear === 2) {
						toggleYear = 0;
						yearGPA = yearUp / yearDown;
						result.push(
							`---${semester.substr(0, semester.length - 2)}学年平均绩点: ${yearGPA.toFixed(3)}---`);
						yearUp = 0;
						yearDown = 0;
					}
				}
				totalGPA = totalUp / totalDown;
				if (isNaN(totalGPA)) {
					totalGPA = 0;
				}
				result.push(`总平均绩点：${totalGPA.toFixed(3)}`);
				console.log(result)
				return result
			},
			modeChange(e) {
				let index = e.detail.value
				switch (index) {
					case 0:
						this.calculateMode = "必修绩点"
						this.manual = false
						break
					case 1:
						this.calculateMode = "必修任选绩点"
						this.manual = false
						break;
					case 2:
						this.calculateMode = "全部绩点"
						this.manual = false
						break
					case 3:
						this.calculateMode = "自选绩点"
						this.manual = true
						break
				}
			},
			checkboxGroupChange(e) {
				let result = []
				console.log(e.detail)
				for (let i of e.detail.value) {
					result.push(this.scoreData[i])
				}
				this.selected = result
			}
		}
	}
</script>

<style>
	.query-button {
		margin: 20rpx;
		font-size: .9em;
	}

	.score-wrap {
		display: flex;
		text-align: center;
		padding: 4px;
		margin: 10px;
		border: 1px solid #dddd;
		border-radius: 10px;
		box-shadow: 1px 1px 5px #888888;
	}

	.score-wrap .item {
		flex: 1;
		align-self: center;
		font-size: .8em;
		line-height: 1.5em
	}

	.dialog {
		background-color: #fafafa;
		width: 500rpx;
		/* height: 500rpx; */
		border-radius: 20rpx;
		padding: 20rpx;
		font-size: 80%;
		text-align: center;
	}

	.dialog-button {
		margin: 20rpx;
		/* position: absolute; */
		/* bottom: -110rpx; */
		left: 0;
		right: 0;
	}

	.current-semester {
		border: #333333;
		border-radius: 20rpx;
		/* font-size: .9em; */
		margin: 20rpx;
		margin-top: 40rpx;
		margin-bottom: 40rpx;
		text-align: center;
	}

	.gpa-info {
		text-align: center;
		font-size: .8em;
		border: #2C405A;
		border-radius: 20rpx;
		box-shadow: 1px 1px 5px #888888;
		margin: 20rpx;
		padding: 20rpx;
	}

	.gpa-mode {
		margin: 20rpx;
		padding: 20rpx;
	}

	.manual-button {
		margin: 20rpx;
	}
</style>
