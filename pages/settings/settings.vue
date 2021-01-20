<template>
	<view>
		<uni-list>
			<uni-list-item :title="getName"></uni-list-item>
			<uni-list-item :title="getStudnetNumber"></uni-list-item>
			<uni-list-item title="账号设置" showArrow="true" badge-text="12" clickable="true" link to="../login/login"></uni-list-item>
			<uni-list-item title="开启校园网访问" note="开启之后需要重新登录" :switchChecked="useVPN" show-switch="true" @switchChange="vpnChange"></uni-list-item>
			<uni-list-item title="查询最好成绩" note="关闭则查询全部成绩" :switchChecked="maxScore" show-switch="true" @switchChange="modeChange"></uni-list-item>
			<uni-list-item title="使用默认成绩查询入口" note="关闭则使用成绩替代入口" :switchChecked="defaultScoreQuery" show-switch="true"
			 @switchChange="entryChange"></uni-list-item>
			<uni-list-item note="点击日期校正" showArrow="true" clickable="true">
				<picker slot="body" mode="date" :value="date" @change="bindDateChange">
					<text space="emsp">校正起始周    当前{{date}}</text>
				</picker>
			</uni-list-item>
			<uni-list-item title="关于" showArrow="true" link to="../about/about" clickable="true"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	const app = getApp()
	const settings = app.globalData.settings
	export default {
		data() {
			return {
				useVPN: settings.useVPN,
				maxScore: settings.maxScore,
				defaultScoreQuery: settings.defaultScoreQuery,
				date: this.getDate(new Date(settings.beginTime)),
				name: app.globalData.course.studentInfo.name,
				number: app.globalData.course.studentInfo.number,
			}
		},
		onShow() {
			this.name = app.globalData.course.studentInfo.name
			this.number = app.globalData.course.studentInfo.number
		},
		methods: {
			vpnChange(e) {
				settings.useVPN = e.value
				uni.setStorage({
					key: "settings_key",
					data: settings,
				})
			},
			entryChange(e) {
				settings.defaultScoreQuery = e.value
				uni.setStorage({
					key: "settings_key",
					data: settings,
				})
			},
			modeChange(e) {
				settings.maxScore = e.value
				uni.setStorage({
					key: "settings_key",
					data: settings,
				})
			},
			getDate(date) {
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
				month = month > 9 ? month : '0' + month;;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			bindDateChange(e) {
				this.date = e.target.value
				let [year, month, day] = this.date.split("-")
				let date = new Date(Date.parse(`${month}/${day}/${year}`))
				console.log(date)
				let correctDate = this.getMonday(date)
				console.log(correctDate)
				settings.beginTime = correctDate.getTime()
				uni.setStorage({
					key: "settings_key",
					data: settings
				})
			},
			getMonday(date) {
				let day = date.getDay();
				let deltaDay;
				if (day == 0) {
					deltaDay = 6;
				} else {
					deltaDay = day - 1;
				}
				let monday = new Date(date.getTime() - deltaDay * 24 * 60 * 60 * 1000);
				monday.setHours(0);
				monday.setMinutes(0);
				monday.setSeconds(0);
				return monday; //返回本周的周一的0时0分0秒
			}

		},
		computed: {
			getName() {
				return `姓名 ${this.name}`
			},
			getStudnetNumber() {
				return `学号 ${this.number}`
			}
		}
	}
</script>

<style>

</style>
